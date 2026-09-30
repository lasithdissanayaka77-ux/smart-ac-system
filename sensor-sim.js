const connect = require('./common/mqttClient');

const ZONES = parseInt(process.argv[2] || '10', 10);
const INTERVAL = parseInt(process.argv[3] || '5000', 10);

const client = connect();
const state = {};
for (let i = 1; i <= ZONES; i++) {
  state[`zone-${i}`] = { temp: 24 + Math.random() * 5, occupied: Math.random() > 0.5, cooling: false };
}

let started = false;
client.on('connect', () => {
  if (started) return; // avoid duplicate timers after a reconnect
  started = true;
  console.log(`Connected. Simulating ${ZONES} zones, one reading every ${INTERVAL} ms each`);
  client.subscribe('smart-ac/+/commands'); 
  Object.keys(state).forEach((zone, idx) => {
    
    setTimeout(() => setInterval(() => publish(zone), INTERVAL), (idx / ZONES) * INTERVAL);
  });
});

client.on('message', (topic, buf) => {
  const zone = topic.split('/')[1];
  if (!state[zone]) return;
  try {
    state[zone].cooling = JSON.parse(buf.toString()).action === 'cool';
  } catch (e) { /* ignore bad messages */ }
});

client.on('error', (e) => console.error('MQTT error:', e.message));

function publish(zone) {
  const s = state[zone];
  if (Math.random() < 0.05) s.occupied = !s.occupied;
  s.temp += s.cooling ? -0.4 : 0.15;      
  s.temp += (Math.random() - 0.5) * 0.2;      
  s.temp = Math.max(18, Math.min(34, s.temp));
  const bad = Math.random() < 0.01;           
  const msg = {
    zone_id: zone,
    temperature: bad ? 99 : Number(s.temp.toFixed(1)),
    humidity: Number((40 + Math.random() * 30).toFixed(1)),
    occupancy: s.occupied,
    timestamp: new Date().toISOString(),
  };
  client.publish(`smart-ac/${zone}/sensors`, JSON.stringify(msg));
}
