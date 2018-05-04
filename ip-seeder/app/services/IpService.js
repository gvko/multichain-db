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

/**
 * Gets and returns the first IP from the list of IPs.
 *
 * Check if the IP's host is alive before returning the IP.
 *
 * @return {Promise<string>}  An IP, eg. '172.20.0.2' if the host is alive, 'NO-IP' otherwise
 */
function getIpFromList() {
  if (!ipList.length > 0) {
    console.log('*** No IPs to return. IP list is empty.');
    return Promise.resolve('NO-IP');
  }

  const ip = ipList[0];

  return pingHost(ip)
    .then((pingResponse) => {
      return pingResponse ? Promise.resolve(ip) : getIpFromList();
    });
}

/**
 * Add the given IP to the list of IPs. If already exists, just skip w/o adding it.
 *
 * @param {string}  ip  The IP to add
 */
function storeIp(ip) {
  if(ipList.indexOf(ip) > 0){
    console.log(`*** IP '${ip}' is already on list of IPs. Skipping...`);
  } else {
    ipList.push(ip);
    console.log(`*** Pushed '${ip}' to the list of IPs`);
  }
}

module.exports = {
  ipList,
  pingHost,
  getIpFromList,
  storeIp
};


