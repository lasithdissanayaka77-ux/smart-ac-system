
const connect = require('../common/mqttClient');
const getDb = require('../common/db');

(async () => {
  const db = await getDb();
  await db.collection('sensor_readings').createIndex({ zone_id: 1, timestamp: -1 });
  
  await db.collection('sensor_readings').createIndex({ timestamp: 1 }, { expireAfterSeconds: 259200 });
  await db.collection('zone_status').createIndex({ zone_id: 1 }, { unique: true });

  const client = connect();
  client.on('connect', () => {
    client.subscribe('$share/ingestion/smart-ac/+/aggregated');
    console.log('Ingestion service running');
  });

  client.on('message', async (topic, buf) => {
    try {
      const d = JSON.parse(buf.toString());
      const ts = new Date(d.timestamp);
      await db.collection('sensor_readings').insertOne({
        zone_id: d.zone_id,
        sensor_type: 'aggregated',
        temperature: d.avg_temperature,
        humidity: d.humidity,
        occupancy: d.occupancy,
        timestamp: ts,
      });
      
      await db.collection('zone_status').updateOne(
        { zone_id: d.zone_id },
        { $set: { temperature: d.avg_temperature, humidity: d.humidity, occupancy: d.occupancy, last_seen: ts } },
        { upsert: true }
      );
    } catch (e) {
      console.error('Ingestion error:', e.message);
    }
  });

  client.on('error', (e) => console.error('MQTT error:', e.message));
})();
