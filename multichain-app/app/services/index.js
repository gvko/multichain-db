'use strict';

const createError = require('../util/create-error');

/**
 * Get general info about the node. Basically just call the info retrieval RPC endpoint of Multichain
 *
 * @param app
 * @return {Promise<void>}
 */
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
