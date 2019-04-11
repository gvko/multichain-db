#!/usr/bin/env node

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const errorHandler = require('./util/catch-and-log-errors');
const logger = require('./util/logger');

const ipService = require('./services/ip');

const ipRouter = require('./routes/ip');

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
  .use('/ip', ipRouter)
  /*
   * Error handler
   */
  .use(errorHandler);

const log = logger('ip-seed');
app.log = log;
global.log = log;

/*
 * Start the service
 */
app.listen(port, () => {
  log.info(`Server started on port ${port} (container exposed: ${process.env.EXPOSED_PORT})`);
  ipService.repeatCheckNodesLiveliness();
});

module.exports = app;
