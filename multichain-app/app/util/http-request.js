'use strict';

require('any-promise/register/q');
const request = require('request-promise-any');
const createError = require('../util/create-error');

/**
 * Simple wrapper for the request module.
 *
 * @param   {object}  opts  The options to pass to the request module. `host` is obligatory!
 * @returns {Promise}
 */
module.exports = async (opts) => {
  if (!opts.host) {
    throw createError('Host URI must be specified!', { opts });
  }

  const protocol = opts.protocol || 'http';
  const port = opts.port ? `:${opts.port}` : '';
  const endpoint = opts.endpoint && opts.endpoint[0] === '/' ? opts.endpoint : `/${opts.endpoint}`;
  const method = opts.method || 'GET';
  const body = opts.body;

  if (body && !['PUT', 'POST'].includes(method)) {
    throw createError(`Cannot have "body" for a ${method} request`, { opts });
  }

  try {
    return await request({
      method,
      uri: `${protocol}://${opts.host}${port}${endpoint}`,
      body,
      json: true
    });
  } catch (err) {
    log.error({ err }, 'Could not perform HTTP request');
    throw createError('Could not perform HTTP request', { err });
  }
};
