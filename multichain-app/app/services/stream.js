'use strict';

const createError = require('../util/create-error');

async function listStreams(app) {
  try {
    return await app.multichain.listStreams();
  } catch (err) {
    throw createError('Could not list streams', { err });
  }
}

async function listStreamItems(app, stream, itemsCount) {
  try {
    const rawData = await app.multichain.listStreamItems({ stream, count: itemsCount || 9999 });
    const data = [];

    for (const row of rawData) {
      data.push(JSON.parse(hexToStr(row.data)));
    }

    return { count: data.length, data };
  } catch (err) {
    throw createError('Could not list stream items', { err });
  }
}

async function createNewStream(app, name) {
  try {
    return await app.multichain.create({ type: 'stream', name, open: true });
  } catch (err) {
    throw createError('Could not create a new stream', { err });
  }
}

async function subscribeToStream(app, stream) {
  try {
    return await app.multichain.subscribe({ stream });
  } catch (err) {
    throw createError('Could not subscribe to a stream', { err });
  }
}

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

function strToHex(str) {
  let hex = '';

  for (let i = 0; i < str.length; i++) {
    hex += '' + str.charCodeAt(i).toString(16);
  }

  return hex;
}

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
