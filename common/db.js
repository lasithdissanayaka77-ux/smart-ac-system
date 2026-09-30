require('dotenv').config();
const { MongoClient } = require('mongodb');

let db;
module.exports = async function getDb() {
  if (!db) {
    const client = await MongoClient.connect(process.env.MONGO_URI);
    db = client.db('smartac');
  }
  return db;
};
