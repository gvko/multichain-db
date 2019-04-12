'use strict';

const createError = require('../util/create-error');

async function listStreams(app) {
  return await app.multichain.listStreams();
}

async function listStreamItems(app, stream, itemsCount) {
  const data = await app.multichain.listStreamItems({ stream, count: itemsCount || 9999 });
  return { count: data.length, data };
}

async function createNewStream(app, name) {
  return await app.multichain.create({ type: 'stream', name, open: true });
}

async function subscribeToStream(app, stream) {
  return await app.multichain.subscribe({ stream });
}

async function publishDataToStream(app, stream, data) {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const key = currentTimestamp.toString();

  return await app.multichain.publish({ stream, key, data: JSON.stringify(input.data) });
}

module.exports = {
  listStreams,
  listStreamItems,
  createNewStream,
  subscribeToStream,
  publishDataToStream
};
