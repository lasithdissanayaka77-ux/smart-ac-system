const express = require('express');
const path = require('path');
const getDb = require('../common/db');

(async () => {
  const db = await getDb();
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/health', (req, res) => res.send('ok'));

  app.get('/api/zones', async (req, res) => {
    const status = await db.collection('zone_status').find().toArray();
    const cfg = await db.collection('zones').find().toArray();
    const overrides = Object.fromEntries(cfg.map((c) => [c.zone_id, c.override || 'auto']));
    const num = (id) => parseInt(id.split('-')[1], 10);
    status.sort((a, b) => num(a.zone_id) - num(b.zone_id));
    res.json(status.map((s) => ({
      zone_id: s.zone_id,
      temperature: s.temperature,
      humidity: s.humidity,
      occupancy: s.occupancy,
      actuator: s.actuator || '-',
      last_seen: s.last_seen,
      override: overrides[s.zone_id] || 'auto',
    })));
  });

  app.post('/api/override', async (req, res) => {
    const { zone_id, mode } = req.body;
    if (!zone_id || !['auto', 'cool', 'off'].includes(mode)) return res.status(400).json({ error: 'bad request' });
    await db.collection('zones').updateOne(
      { zone_id },
      { $set: { override: mode }, $setOnInsert: { target_temp: 24 } },
      { upsert: true }
    );
    res.json({ ok: true });
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log('Dashboard on port ' + port));
})();
