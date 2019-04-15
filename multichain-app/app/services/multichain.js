'use strict';

const Multichain = require('multichain-node');
const httpRequest = require('../util/http-request');
const cron = require('node-cron');

const REPEAT_NODE_LIVE_CHECK_SEC = 5;
let task;

/**
 * Initialize the Multichain connection and start a repetitive check-connection-liveliness process.
 *
 * @param app
 */
async function init(app) {
  const host = await getNodeHost();
  app.multichain = await createNewMultichainConnection(host);

  repeatCheckNodeLiveliness(app, host);
}

/**
 * Create a new Multichain Node connection.
 *
 * @param   {string}  host
 * @returns {Multichain}  multichain
 */
async function createNewMultichainConnection(host) {
  log.info({ host }, `Connecting the app to a new Multichain Node: ${host}`);

  const multichain = Multichain({
    user: process.env.MULTICHAIN_USER,
    pass: process.env.MULTICHAIN_PASS,
    host: host,
    port: process.env.MULTICHAIN_PORT
  });

  try {
    await multichain.getInfo();
    log.info(`Successfully connected to ${host}`);
  } catch (err) {
    log.warn({ host, err }, 'Cloud NOT connect to Multichain Node!');
  }

  return multichain;
}

/**
 * Get a Multichain node host.
 *
 * @returns {Promise<string>}
 */
async function getNodeHost() {
  const host = await httpRequest({
    host: process.env.IP_SEED_HOST,
    port: process.env.IP_SEED_PORT,
    endpoint: '/ip/get'
  });

  process.env.MULTICHAIN_HOST = host;
  return host;
}

/**
 * Check if the given Multichain node is alive and kickin', and if not - try to reconnect to a new one.
 *
 * @param   {object}  app
 * @param   {string}  host  The current node's host to check the liveliness of
 */
async function checkNodeIsLiveAndReconnect(app, host) {
  log.info({ host }, 'Checking Multichain Node is still live...');

  const nodeIsLive = await httpRequest({
    host: process.env.IP_SEED_HOST,
    port: process.env.IP_SEED_PORT,
    endpoint: `/ip/check?ip=${host}`
  });

  if (!nodeIsLive) {
    log.warn({ host }, `Multichain Node is down! IP ${host}`);

    const newHost = await getNodeHost();
    const newMultichainConn = await createNewMultichainConnection(newHost);
    delete app.multichain;
    app.multichain = newMultichainConn;

    repeatCheckNodeLiveliness(app, newHost);
  } else {
    log.info({ host }, 'All good!');
  }
}

/**
 * Start a repetitive check process for liveliness of the current Multichain node connection.
 * If a process already exists - destroy it and start a new one, so that we don't end up having multiple concurrent
 * check processes.
 *
 * @param   {object}  app
 * @param   {string}  host  The current node's host to check the liveliness of
 */
function repeatCheckNodeLiveliness(app, host) {
  if (task) {
    task.destroy();
  }

  log.info(`Start repetitive check for Multichain Node liveliness every ${REPEAT_NODE_LIVE_CHECK_SEC} sec at IP: ${host}`);

  task = cron.schedule(`*/${REPEAT_NODE_LIVE_CHECK_SEC} * * * * *`, async () => {
      await checkNodeIsLiveAndReconnect(app, host);
    },
    { scheduled: false }
  );

  task.start();
}

module.exports = {
  init
};



