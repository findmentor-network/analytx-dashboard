const express = require('express')
const { connect, count } = require("./db");
const app = express()
const cors = require("cors")
const port = 3000

const path = __dirname + '/app/dist/';

app.use(express.static(path));
app.use(express.json());
app.use(cors());
app.options("*", cors());

app.get('/', function (req,res) {
  res.sendFile(`${path}index.html`);
});

app.get('/count', async (req, res) => {
  const { span, range } = req.query;
  let result = await count("https://findmentor.network", Number(span), Number(range));
  res.json(result)
})

connect().then(() => {
  app.listen(port, (_) => {
    console.log(`analytics app listening at http://localhost:${port}`);
  });
});