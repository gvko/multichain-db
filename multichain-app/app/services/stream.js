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
    const data = await app.multichain.listStreamItems({ stream, count: itemsCount || 9999 });
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

async function publishDataToStream(app, stream, data) {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const key = currentTimestamp.toString();

  try {
    return await app.multichain.publish({ stream, key, data: JSON.stringify(data) });
  } catch (err) {
    throw createError('Could not publish data to the stream', { err });
  }
}

module.exports = {
  listStreams,
  listStreamItems,
  createNewStream,
  subscribeToStream,
  publishDataToStream
};
