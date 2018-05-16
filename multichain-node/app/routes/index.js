'use strict';

const express = require('express');
const router = express.Router();

router.get('/info', function (req, res, next) {
  console.log('> Getting info about the blockchain...');

  return app.multichain.getInfoPromise()
    .then(data => res.json(data))
    .catch(err => {
      console.error(err);
      res.json(err);
    });
});

router.get('/ping', function (req, res, next) {
  return res.sendStatus(418).send('pong');
});

module.exports = router;
