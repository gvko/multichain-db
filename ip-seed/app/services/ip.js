'use strict';

const repeat = require('repeat');
const ping = require('ping');

const ipList = [];
const REPEAT_NODE_LIVE_CHECK_MILLISECONDS = 5000;

/**
 *
 * @param ip
 * @returns {*}
 */
function add(ip) {
  if (!ipList.includes(ip)) {
    ipList.push(ip);
    log.info({ ip }, 'ADD: Node IP added to the seed');
  } else {
    log.warn({ ip }, 'Node IP already exists in the seed');
  }

  return ip;
}

/**
 * Removes an IP from the list, if it exists.
 *
 * @param   {string}  ip  The IP to remove
 * @returns {boolean} true if the IP exists and has been removed, false if the IP does not exist
 */
function remove(ip) {
  const index = ipList.indexOf(ip);
  if (index > -1) {
    ipList.splice(index, 1);
    log.info({ ip }, 'REMOVE: Node IP removed from the seed');

    return true;
  } else {
    log.warn({ ip }, `Could not remove node IP ${ip}: not present in the seed`);

    return false;
  }
}

/**
 * Returns an IP from the list of IPs, on a random basis.
 *
 * @returns {string} an IP
 */
async function getRandomNodeIp() {
  if (ipList.length < 1) {
    log.warn('Seed is empty! Return "NO-IP" signal!');

    return 'NO-IP';
  }

  let stop = true;
  let ip = ipList[randomIntFromInterval(0, ipList.length)];

  while (ipList.length > 0 && !stop) {
    stop = await checkLivelinessAndRemove(ip);
  }

  return ip;
}

/**
 * Ping a node by its IP to check it's alive and kickin'. Expect minimum 2 replies.
 *
 * @param   {string}  ip          The node's IP to check for
 * @param   {string}  reqSource   The source the request to check comes from
 * @returns {Promise} an object containing various info from the `ping` command. {boolean} "alive" is one of them
 */
async function checkNodeIsLive(ip, reqSource) {
  log.debug(`Ping ${ip} (source: ${reqSource})`);
  return ping.promise.probe(ip, { min_reply: 2 });
}

/**
 * Check if node is alive. If not - remove IP from seed.
 *
 * @param {string}  ip          The IP of the host to check for
 * @param {string}  reqSource   The source the request to check comes from
 * @returns {Promise<boolean>}
 */
async function checkLivelinessAndRemove(ip, reqSource) {
  if (ipList.length < 1) {
    log.warn('Seed is empty! Nothing to check liveliness for...');

    return false;
  }

  const checkRes = await checkNodeIsLive(ip, reqSource || 'internal');

  if (!checkRes.alive) {
    log.warn({ ip }, `Node is not live. Removing IP ${ip} from seed...`);
    remove(ip);

    return false;
  } else {
    return true;
  }
}

function repeatCheckNodesLiveliness() {
  log.info(`Start repetitive check for node liveliness every ${REPEAT_NODE_LIVE_CHECK_MILLISECONDS / 1000} sec`);

  repeat()
    .do(() => {
      for (const ip of ipList) {
        checkLivelinessAndRemove(ip, 'internal');
      }
    })
    .every(REPEAT_NODE_LIVE_CHECK_MILLISECONDS);
}

/**
 * Generate random number. Min and Max included.
 *
 * @param min
 * @param max
 * @returns {number}
 */
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = {
  add,
  remove,
  getRandomNodeIp,
  checkLivelinessAndRemove,
  repeatCheckNodesLiveliness
};
