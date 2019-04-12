#!/usr/bin/env node

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const errorHandler = require('./util/catch-and-log-errors');
const logger = require('./util/logger');

const indexRouter = require('./routes/index');
const streamRouter = require('./routes/stream');
const multichainService = require('./services/multichain');

const app = express();
const port = process.env.PORT || '3000';

app
  .use(bodyParser.json())
  .options('*', cors())
  .use(cors())
  .use(bodyParser.urlencoded({ extended: true }))
  /*
   * Routes
   */
  .use('/index', indexRouter)
  .use('/stream', streamRouter)
  /*
   * Error handler
   */
  .use(errorHandler);

const log = logger(process.env.APP_NAME);
app.log = log;
global.log = log;

/*
 * Start the service
 */
app.listen(port, async () => {
  log.info(`Server started on port ${port} (container exposed: ${process.env.EXPOSED_PORT})`);

  app.multichain = await multichainService.init(app);
});

module.exports = app;
