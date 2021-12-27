const db = require('./database.js');
const helmet = require('helmet');
// const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const express = require('express');
const path = require('path');
const app = express();
const port = 3001;

app.use(helmet());
app.use(express.static(path.resolve(__dirname, './client/build')));
app.use(express.urlencoded({ extended:true }));

//app.get('/', (req, res) => {
//  res.send('hello world');
//});

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.post('/species', async (req, res) => {
  const id = req.body.code;
  const result = await db.get({ id:id }, 'species');
  res.json(result);

});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});