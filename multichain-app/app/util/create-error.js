'use strict';

const types = {
  'notFound': 404,
  'badRequest': 400,
  'serverError': 500,
  'unauthorized': 401,
  'forbidden': 403
};

/**
 * Simple wrapper of the native Node Error object to create custom errors
 *
 * @param {string}  message The message to be displayed with the error
 * @param {object}  data    Any data to be returned with the error
 * @return {Error}
 */
module.exports = (message, data) => {
  const error = new Error(message);

  error['data'] = data ? data : {};

  if (!data || !data.statusCode) {
    error['data'].statusCode = types['serverError'];
  }

  return error;
};
