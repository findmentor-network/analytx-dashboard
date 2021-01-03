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
  // return db.collection(host).aggregate([
  //   {
  //     $group: {
  //       _id: "$fingerprint",
  //       "count": { $sum: 1 },
  //     }
  //   }
  // ]).toArray();


  // var today = new Date(),
  //   oneDay = (1000 * 60 * 60 * 24),
  //   thirtyDays = new Date(today.valueOf() - (30 * oneDay)),
  //   fifteenDays = new Date(today.valueOf() - (15 * oneDay)),
  //   sevenDays = new Date(today.valueOf() - (7 * oneDay));

  let hours = [
    1609675783000, // 15:00
    1609677583000, // 15:30 // 1609677 // 0 - 1 = 29 // 1 - 2 = 29 // 2 - 3 = 32 // 619
    1609679383000,
    1609681183000,
    1609682983000,
    1609684783000,
    1609686583000,
    1609688383000,
    1609690183000,
    1609691983000,
    1609693783000,
    1609695583000,
  ];

  // return db.collection(host).find({
  //   date: {
  //     $gte: hours[ 3 ],
  //     $lt: hours[ 4]
  //   }
  // }).count();


  return db.collection(host).aggregate([
    {
      "$match": {
        "date": { "$gte": hours[ 0 ], "$lt": hours[11] },
      }
    },
    {
      "$group": {
        "_id": condGenerator(hours),
        "count": { "$sum": 1 }
      }
    }
  ]).toArray();
};

const condGenerator = (hours, index = 0) => {
  if (hours.length < index) {
    return index - 1;
  }


  return {
    "$cond": [
      { "$gt": [ "$date", hours[ index ] ] },
      condGenerator(hours, ++index),
      index - 1
    ]
  }
}


module.exports = {
  connect, count,
};
