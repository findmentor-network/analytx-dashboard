const data = require('./data.json')

// Per hours
var hours = [];
var span = 30; // minutes
var range = 6; // hours
var sliceCount = (range * 60) / span;
// var date = new Date();
// date.setHours(date.getHours() - range);
// date.setMilliseconds(0);
// while (sliceCount) {
//   let a = date.setMinutes(date.getMinutes() + span);
//   hours.push(a);
//   sliceCount--;
// }

hours = [
  1609675783000, // 15:00
  1609677583000, // 15:30
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

let counters = Array(sliceCount).fill(0)