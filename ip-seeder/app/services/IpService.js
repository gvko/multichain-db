'use strict';

const ping = require('ping');
const ipList = [];

/**
 * Pings a host by a given IP and responds with whether it's alive or not.
 * If the host is NOT alive - then remove its (the given) IP from the list of IPs.
 *
 * @param   {string}  ip  The IP of the host to ping
 * @return {Promise<boolean>}  true/false for whether the host is alive
 */
function pingHost(ip) {
  console.log(`*** Pinging '${ip}' to verify it is alive...`);

  return ping.promise.probe(ip, { min_reply: 2 })
    .then((pingResponse) => {
      if (!pingResponse.alive) {
        console.log(`*** IP '${ip}' not responding. Remove from list...`);
        ipList.splice(ipList.indexOf(ip), 1);
      } else {
        console.log(`*** '${ip}' is alive`);
      }

      return Promise.resolve(pingResponse.alive);
    });
}

module.exports = {
  ipList,
  pingHost
};


