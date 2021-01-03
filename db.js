const { MongoClient } = require('mongodb');
const { fixProtocol } = require('./utils');

let client;
let db;

// connects to db
async function connect() {
  const URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
  client = await MongoClient.connect(URI, { useUnifiedTopology: true });
  db = client.db('analytics');
}

const count = (url) => {
  const { host, pathname } = new URL(fixProtocol(url));
  return db.collection(host).aggregate([
    {
      $group: {
        _id: "$fingerprint",
        "count": { $sum: 1 },
      }
    }
  ]).toArray();
  // return db.collection(host).aggregate([
  //   { $group: { _id: { fingerprint: '$fingerprint', pathname: '$pathname' }, total: { $sum: 1 } } },
  //   { $project: { fingerprint: '$_id.fingerprint', pathname: '$_id.pathname', total: '$total', _id: 0 } }
  // ]).toArray();
};


module.exports = {
  connect, count,
};
