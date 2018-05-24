'use strict';

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./routes/index');
const streams = require('./routes/streams');

global.app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/streams', streams);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json('error');
});

const bluebird = require('bluebird');
const Multichain = require('multichain-node');

if(!process.env.RPC_USERNAME){
  console.error('\n*** ERROR: RPC_USERNAME env var is not defined! Exiting...');
  process.exit(1);
}
if(!process.env.RPC_PASSWORD){
  console.error('\n*** ERROR: RPC_PASSWORD env var is not defined! Exiting...');
  process.exit(1);
}

const multichain = bluebird.promisifyAll(Multichain({
  user: process.env.RPC_USERNAME,
  pass: process.env.RPC_PASSWORD,
  host: process.env.NODE_HOST_IP,
  port: process.env.NODE_PORT_RPC
}), { suffix: 'Promise' });

app.multichain = multichain;

module.exports = app;
