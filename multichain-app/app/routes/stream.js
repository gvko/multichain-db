'use strict';

const express = require('express');
const router = express.Router();
const streamService = require('../services/stream');

router.get('/list', async (req, res, next) => {
  res.json(await streamService.listStreams(req.app));
});

router.get('/items', async (req, res, next) => {
  res.json(await streamService.listStreamItems(req.app, req.query.stream, req.query.itemsCount));
});

router.post('/create', async (req, res, next) => {
  res.json(await streamService.createNewStream(req.app, req.body.name));

});

router.post('/subscribe', async (req, res, next) => {
  res.json(await streamService.subscribeToStream(req.app, req.body.stream));
});

router.post('/publish', async (req, res, next) => {
  res.json(await streamService.publishDataToStream(req.app, req.body.stream, req.body.data));
});

module.exports = router;
