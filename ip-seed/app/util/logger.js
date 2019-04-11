'use strict';

const bunyan = require('bunyan');
const bunyanPretty = require('bunyan-pretty');

/**
 * Initializes the logger object, used to send logs (console for local dev and LogDNA for production)
 *
 * @param   {string}  serviceName the name of the service to attach to the logger
 * @returns the log object
 */
module.exports = (serviceName) => {
  /* We only declare DEBUG and INFO because they are the lowest levels that we need. Any other levels are higher:
   *  fatal  (60)
   *  error  (50)
   *  warn   (40)
   *  info   (30)
   *  debug  (20)
   *
   * By declaring DEBUG stream to be the console and INFO stream to be our logging server we say that anything from
   * DEBUG and above will be logged in console and anything from INFO and above will be logged in the server.
   * This way we get INFO and above to be in both console and server.
   */
  return bunyan.createLogger({
    name: serviceName || process.env.HOSTNAME,
    streams: [{
      formatter: 'pretty',
      stream: bunyanPretty(),
      level: 'debug'
    }]
  });
};
