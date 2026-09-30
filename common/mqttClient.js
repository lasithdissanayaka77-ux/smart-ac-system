require('dotenv').config();

const mqtt = require('mqtt');
const fs = require('fs');

module.exports = function connect() {
  if (process.env.BROKER === 'aws') {
    return mqtt.connect({
      host: process.env.AWS_IOT_ENDPOINT,
      port: 8883,
      protocol: 'mqtts',
      protocolVersion: 5,
      key: fs.readFileSync(process.env.AWS_KEY),
      cert: fs.readFileSync(process.env.AWS_CERT),
      ca: fs.readFileSync(process.env.AWS_CA),
      keepalive: 120,
      reconnectPeriod: 1000,
      connectTimeout: 30000,
    });
  }

  return mqtt.connect(process.env.MQTT_URL, {
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASS,
    protocolVersion: 5,
    keepalive: 120,
    reconnectPeriod: 1000,
    connectTimeout: 30000,
  });
};
