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

const count = (url, span = 30, range = 2) => {
  const { host, pathname } = new URL(fixProtocol(url));

  var hours = [];
  var date = new Date();
  var sliceCount = (range * 60) / span;
  date.setHours(date.getHours() - range);
  date.setMilliseconds(0);
  while (sliceCount) {
    let a = date.setMinutes(date.getMinutes() + span);
    hours.push(a);
    sliceCount--;
  }

  return db.collection(host).aggregate([
    {
      "$match": {
        "date": { "$gte": hours[ 0 ], "$lte": hours[ hours.length - 1 ] },
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
  if (hours.length <= index) {
    return index;
  }
  const nextIndex = index + 1;

  return {
    "$cond": [
      { "$gt": [ "$date", hours[ index ] ] },
      condGenerator(hours, nextIndex),
      index
    ]
  }
}


module.exports = {
  connect, count,
};
