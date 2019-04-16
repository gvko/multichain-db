'use strict';

const express = require('express');
const router = express.Router();
const ipService = require('../services/ip');

router.get('/check', async (req, res, next) => {
  res.send(await ipService.checkLivelinessAndRemove(req.query.ip, req.query.source || 'external'));
});

router.get('/get', async (req, res, next) => {
  res.send(await ipService.getRandomNodeIp());
});

router.post('/publish', (req, res, next) => {
  res.send(ipService.add(req.body.ip));
});

router.post('/remove', (req, res, next) => {
  res.send(ipService.remove(req.body.ip));
});


module.exports = router;
