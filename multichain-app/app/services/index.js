'use strict';

const createError = require('../util/create-error');

async function getNodeInfo(app) {
  return await app.multichain.getInfo();
}

module.exports = {
  getNodeInfo
};
