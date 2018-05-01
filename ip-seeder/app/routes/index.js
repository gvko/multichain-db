'use strict';

const express = require('express');
const router = express.Router();

const ipList = [];


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
  console.log(`*** Pushed '${req.body.ip} to the list of IPs'`);

  return res.sendStatus(200);
});

router.post('/check-ip', (req, res) => {
  const ipToCheck = req.body.ip;
  //TODO: ping for the given IP and delete it if ping not responding
});

router.get('/get-all-ip', (req, res) => {
  console.log(`*** Returning all IPs...`);
  console.log(ipList);

  return res.status(200).json(ipList);
});

module.exports = router;
