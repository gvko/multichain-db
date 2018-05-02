'use strict';

const express = require('express');
const router = express.Router();
const IpService = require('../services/IpService.js');

/**
 * Return a node's IP.
 * The first one in the list.
 *
 * @method  GET
 *
 * @return  {string}  Eg. '172.20.0.2' or 'NO-IP' if list of IPs is empty
 */
router.get('/get-node-ip', (req, res) => {
  if (IpService.ipList.length > 0) {
    console.log(`*** Returning an IP: ${IpService.ipList[0]}`);
    return res.status(200).send(IpService.ipList[0]);
  } else {
    console.log('*** No IPs to return. IP list is empty.');
    return res.status(400).send('NO-IP')
  }
});

/**
 * Add an IP to the list.
 *
 * @method  POST
 * @param   {string}    ip  The IP to add
 *
 * @return  {string}  OK
 */
router.post('/publish-ip', (req, res) => {
  IpService.ipList.push(req.body.ip);
  console.log(`*** Pushed '${req.body.ip}' to the list of IPs`);

  return res.sendStatus(200);
});

/**
 * Ping an IP to check if the host is alive. If yes - just return `true`.
 * If not - then remove the IP from the list and return `false`.
 *
 * @method  GET
 * @param   {string}    ip  The IP to ping
 *
 * @return  {boolean} true/false
 */
router.get('/check-ip', (req, res) => {
  const ipToCheck = req.query.ip;

  console.log(`*** Pinging '${ipToCheck}' to verify it is alive...`);

  return IpService.pingHost(ipToCheck)
    .then((pingResponse) => {
      return res.status(200).json(pingResponse);
    });
});

/**
 * Return a list the IPs of active hosts.
 *
 * @method  GET
 *
 * @return  {array} Eg. ['172.20.0.2', '172.20.0.4', '172.20.0.5', '172.20.0.1', ...]
 */
router.get('/get-all-ip', (req, res) => {
  console.log(`*** Returning all IPs...`);

  return res.status(200).json(IpService.ipList);
});


module.exports = router;
