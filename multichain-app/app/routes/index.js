'use strict';

const express = require('express');
const router = express.Router();
const indexService = require('../services/index');

router.get('/get-info', async (req, res, next) => {
  res.json(await indexService.getNodeInfo(req.app));
});

module.exports = router;
