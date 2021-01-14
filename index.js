const express = require('express')
const { connect, count, mostFrequentlyVisited, referrers } = require("./db");
const app = express()
const cors = require("cors")
const port = 3000
const {getHREF} = require('./utils')
const path = __dirname + '/app/dist/';

app.use(express.static(path));
app.use(express.json());
app.use(cors());
app.options("*", cors());

app.get('/', function (req,res) {
  res.sendFile(`${path}index.html`);
});

app.get('/count/*', async (req, res) => {
  const { span, range } = req.query;
  const hostname = getHREF(req)
  let result = await count(hostname, Number(span), Number(range));
  res.json(result)
})

app.get("/pathVisited/*", async (req, res) => {
  const { range } = req.query;
  const hostname = getHREF(req);
  let result = await mostFrequentlyVisited(
    hostname,
    Number(range)
  );
  res.json(result);
});

app.get("/referrers/*", async (req, res) => {
  const { range } = req.query;
  const hostname = getHREF(req);
  let result = await referrers(hostname, Number(range));
  res.json(result);
});

connect().then(() => {
  app.listen(port, (_) => {
    console.log(`analytics app listening at http://localhost:${port}`);
  });
});