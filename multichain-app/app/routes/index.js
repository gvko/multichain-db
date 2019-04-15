'use strict';

const express = require('express');
const router = express.Router();
const indexService = require('../services/index');

router.get('/get-info', async (req, res, next) => {
  try {
    res.json(await indexService.getNodeInfo(req.app));
  } catch (err) {
    res.status(500);
    return next(err);
  }
});

module.exports = router;
