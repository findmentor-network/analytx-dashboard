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

const count = async (url, span = 30, range = 2) => {
  const { host, pathname } = new URL(fixProtocol(url));

  var hours = [];
  var labels = [];
  var date = new Date();
  var sliceCount = (range * 60) / span;
  var sorted = Array(sliceCount).fill(0);
  date.setHours(date.getHours() - range);
  date.setMilliseconds(0);
  while (sliceCount) {
    var a = date.setMinutes(date.getMinutes() + span);
    var hour = String(date.getHours());
    var minute = String(date.getMinutes());
    hours.push(a);
    labels.push(`${hour.padStart(2, 0)}:${minute.padStart(2, 0)}`);
    sliceCount--;
  }
  let result = await db.collection(host).aggregate([
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
  ]).toArray()
  
  for (var i = 0; i < result.length; i++) {
    var element = result[i];
    sorted[element._id - 1] = element.count;
  }

  return {
    labels,
    data: sorted,
  };
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

const mostFrequentlyVisited = (url, range) => {
  const { host } = new URL(fixProtocol(url));
  var date = new Date();
  date.setHours(date.getHours() - range);
  // En cok ziyaret almis sayfalari coktan aza siralicaz.
  return db
    .collection(host)
    .aggregate([
      {
        $match: {
          date: { $gte: date.valueOf() },
        },
      },
      { $group: { _id: "$pathname", count: { $sum: 1 } } },
      { $sort: { "count": -1 } },
    ])
    .toArray();
}

const referrers = (url, range) => {
  const { host } = new URL(fixProtocol(url));
  var date = new Date();
  date.setHours(date.getHours() - range);
  // En cok ziyaret almis sayfalari coktan aza siralicaz.
  return db
    .collection(host)
    .aggregate([
      {
        $match: {
          date: { $gte: date.valueOf() },
        },
      },
      { $group: { _id: "$referrer", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();
};


module.exports = {
  connect,
  count,
  mostFrequentlyVisited,
  referrers,
};
