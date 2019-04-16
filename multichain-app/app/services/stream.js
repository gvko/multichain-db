'use strict';

const createError = require('../util/create-error');

/**
 * List all data streams in the blockchain
 *
 * @param app
 * @return {Promise<*>}
 */
async function listStreams(app) {
  try {
    return await app.multichain.listStreams();
  } catch (err) {
    throw createError('Could not list streams', { err });
  }
}

/**
 * List the items (records) in a certain stream
 *
 * @param app
 * @param {string}  stream      The name of the stream for which to list the records
 * @param {number}  itemsCount  The number of records to return
 * @return {Promise<{count: number, data: Array}>}
 */
async function listStreamItems(app, stream, itemsCount) {
  try {
    const rawData = await app.multichain.listStreamItems({ stream, count: itemsCount || 9999 });
    const data = [];

    /*
     * Multichain requires the data in the streams to be stored in HEX-DEC format, so we need to convert it back
     * to JSON.
     */
    for (const row of rawData) {
      data.push(JSON.parse(hexToStr(row.data)));
    }

    return { count: data.length, data };
  } catch (err) {
    throw createError('Could not list stream items', { err });
  }
}

/**
 * Creates a new data stream
 *
 * @param app
 * @param {string}  name  The name for the new stream
 * @return {Promise<void>}
 */
async function createNewStream(app, name) {
  try {
    return await app.multichain.create({ type: 'stream', name, open: true });
  } catch (err) {
    throw createError('Could not create a new stream', { err });
  }
}

/**
 * Subscribe the client to a certain data stream
 *
 * @param app
 * @param {string}  stream  The name of the stream to subscribe to
 * @return {Promise<PushSubscription>}
 */
async function subscribeToStream(app, stream) {
  try {
    return await app.multichain.subscribe({ stream });
  } catch (err) {
    throw createError('Could not subscribe to a stream', { err });
  }
}

/**
 * Write new data to a stream
 *
 * @param app
 * @param {string}                stream    The name of the stream to write (publish) to
 * @param {object|string|number}  inputData The data to be written. Can be text, number or JSON
 * @return {Promise<void>}
 */
async function publishDataToStream(app, stream, inputData) {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const key = currentTimestamp.toString();
  const data = strToHex(JSON.stringify(inputData));

  try {
    return await app.multichain.publish({ stream, key, data });
  } catch (err) {
    throw createError('Could not publish data to the stream', { err });
  }
}

/**
 * Convert a string to hex-dec value
 *
 * @param {string}  input
 * @return {string|string}
 */
function strToHex(input) {
  let hex = '';

  for (let i = 0; i < input.length; i++) {
    hex += '' + input.charCodeAt(i).toString(16);
  }

  return hex;
}

/**
 * Convert a hex-dec value to string
 *
 * @param hexStr
 * @return {Buffer}
 */
function hexToStr(hexStr) {
  return new Buffer.from(hexStr, 'hex');
}

module.exports = {
  listStreams,
  listStreamItems,
  createNewStream,
  subscribeToStream,
  publishDataToStream
};
