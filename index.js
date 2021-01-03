const express = require('express')
const { connect, count } = require("./db");
const app = express()
const port = 3000

const path = __dirname + '/app/dist/';

app.use(express.static(path));
app.use(express.json());

app.get('/', function (req,res) {
  res.sendFile(`${path}index.html`);
});

app.get('/count', async (req, res) => {
  const { span, range } = req.query;
  res.json({count: await count("https://findmentor.network", Number(span), Number(range))})
})

connect().then(() => {
  app.listen(port, (_) => {
    console.log(`analytics app listening at http://localhost:${port}`);
  });
});