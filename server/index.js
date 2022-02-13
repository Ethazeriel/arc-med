const db = require('./database.js');
const helmet = require('helmet');
// const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const express = require('express');
const path = require('path');
const { logLine, logDebug } = require('./logger.js');
const { injest } = require('./injest.js');
const chalk = require('chalk');
const arc = require('./arc.json');
const app = express();
const port = 4001;

app.use(helmet());
app.use('/arc', express.static(path.resolve(__dirname, '../client/build')));
app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use(express.json());


app.get('/', (req, res) => {
  logLine('get', [`Endpoint ${chalk.blue('/')}`]);
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.get('/info', async (req, res) => {
  logLine('get', [`Endpoint ${chalk.blue('/info')}`]);
  arc.drugs = await db.list('arcname', 'drugs');
  res.json(arc);
});

app.post('/species', async (req, res) => {
  logLine('post', [`Endpoint ${chalk.blue('/species')}, code ${chalk.green(req.body.code)}`]);
  const id = req.body.code;
  const result = await db.get({ id:id }, 'species');
  res.json(result);
});

app.post('/drugs', async (req, res) => {
  logLine('post', [`Endpoint ${chalk.blue('/drugs')}, code ${chalk.green(req.body.code)}`]);
  const id = req.body.code;
  const result = await db.get({ arcname:id }, 'drugs');
  res.json(result);
});

app.post('/intake', async (req, res) => {
  logLine('post', [`Endpoint ${chalk.blue('/intake')}, code ${chalk.green(`${req.body.year}-${req.body.id}`)}`]);
  // console.log(req.body);
  const newintake = req.body;
  const response = await injest(newintake);
  res.json(response);
});

app.post('/board', async (req, res) => {
  logLine('post', [`Endpoint ${chalk.blue('/board')}, code ${chalk.green(`${req.body.date}`)}`]);
  const date = req.body.date;
  const response1 = await db.getAll({ 'drugs.when':date }, 'patients');
  const response2 = await db.getAll({ $and:[{ 'drugs.when':{ $ne:date } }, { 'drugs.done':false }] }, 'patients');
  const response = {
    now:response1,
    cont:response2,
  };
  res.json(response);
});

app.listen(port, () => {
  logLine('info', [`Backend listening at http://localhost:${port}, Node version: ${process.version}`]);
  logDebug(chalk.red.bold('DEBUG MODE ACTIVE'));
});