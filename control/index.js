const connect = require('../common/mqttClient');
const getDb = require('../common/db');

(async () => {
  const db = await getDb();
  await db.collection('control_events').createIndex({ timestamp: -1 });
  await db.collection('control_events').createIndex({ timestamp: 1 }, { expireAfterSeconds: 259200 });

  const client = connect();
  client.on('connect', () => {
    client.subscribe('$share/control/smart-ac/+/commands');
    console.log('Control service running');
  });

  client.on('message', async (topic, buf) => {
    try {
      const c = JSON.parse(buf.toString());
      
      const before = await db.collection('zone_status').findOneAndUpdate(
        { zone_id: c.zone_id },
        { $set: { actuator: c.action, reason: c.reason, actuator_updated: new Date() } },
        { upsert: true }
      );
      if (!before || before.actuator !== c.action) {
        await db.collection('control_events').insertOne({
          zone_id: c.zone_id,
          action: c.action,
          reason: c.reason,
          triggered_by: c.triggered_by,
          timestamp: new Date(c.timestamp),
        });
      }
    } catch (e) {
      console.error('Control error:', e.message);
    }
  });

  client.on('error', (e) => console.error('MQTT error:', e.message));
})();
