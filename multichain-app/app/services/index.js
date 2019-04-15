'use strict';

const createError = require('../util/create-error');

async function getNodeInfo(app) {
  try {
    return await app.multichain.getInfo();
  } catch (err) {
    throw createError('Could not get info about node', { err });
  }
}

module.exports = {
  getNodeInfo
};
