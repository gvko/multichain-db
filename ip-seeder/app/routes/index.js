'use strict';

const express = require('express');
const router = express.Router();
const ping = require('ping');

let ipList = [];


router.get('/get-node-ip', (req, res) => {
  if (ipList.length > 0) {
    console.log(`*** Returning an IP: ${ipList[0]}`);
    return res.status(200).send(ipList[0]);
  } else {
    console.log('*** No IPs to return. IP list is empty.');
    return res.status(400).send('NO-IP')
  }
});

router.post('/publish-ip', (req, res) => {
  ipList.push(req.body.ip);
  console.log(`*** Pushed '${req.body.ip}' to the list of IPs`);

  return res.sendStatus(200);
});

router.post('/check-ip', (req, res) => {
  const ipToCheck = req.body.ip;

  console.log(`*** Pinging '${ipToCheck}' to verify it is alive...`);

  return ping.promise.probe(ipToCheck, { min_reply: 2 })
    .then((pingResponse) => {
      if (!pingResponse.alive) {
        console.log(`*** IP '${ipToCheck}' not responding. Remove from list...`);
        ipList.splice(ipList.indexOf(ipToCheck), 1);

        return res.status(200).json(pingResponse.alive);
      }

      console.log(`*** '${ipToCheck}' is alive`);
      return res.status(200).json(pingResponse.alive);
    });
});

router.get('/get-all-ip', (req, res) => {
  console.log(`*** Returning all IPs...`);
  console.log(ipList);

  return res.status(200).json(ipList);
});

module.exports = router;
