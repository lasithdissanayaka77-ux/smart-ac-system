const connect = require('../common/mqttClient');
const getDb = require('../common/db');
const { decide } = require('./logic');

(async () => {
  const db = await getDb();
  const client = connect();

  client.on('connect', () => {
    
    client.subscribe('$share/decision/smart-ac/+/aggregated');
    console.log('Decision service running');
  });

  client.on('message', async (topic, buf) => {
    try {
      const d = JSON.parse(buf.toString());
      const zone = await db.collection('zones').findOne({ zone_id: d.zone_id });
      const result = decide({
        temp: d.avg_temperature,
        occupied: d.occupancy,
        target: zone?.target_temp,
        override: zone?.override,
      });
      client.publish(
        `smart-ac/${d.zone_id}/commands`,
        JSON.stringify({ zone_id: d.zone_id, ...result, timestamp: new Date().toISOString() })
      );
    } catch (e) {
      console.error('Decision error:', e.message);
    }
  });

  client.on('error', (e) => console.error('MQTT error:', e.message));
})();
