'use strict';

const express = require('express');
const router = express.Router();
const indexService = require('../services/index');

router.get('/get-info', (req, res, next) => {
  return multichain.getInfoPromise()
    .then((data) => res.json(data))
    .catch((err) => res.json(err));
});

module.exports = router;
