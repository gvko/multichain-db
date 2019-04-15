'use strict';

const express = require('express');
const router = express.Router();
const streamService = require('../services/stream');

router.get('/list', async (req, res, next) => {
  try {
    res.json(await streamService.listStreams(req.app));
  } catch (err) {
    res.status(500);
    res.json(err);
  }
});

router.get('/items', async (req, res, next) => {
  try {
    res.json(await streamService.listStreamItems(req.app, req.query.stream, req.query.itemsCount));
  } catch (err) {
    res.status(500);
    return next(err);
  }
});

router.post('/create', async (req, res, next) => {
  try {
    res.json(await streamService.createNewStream(req.app, req.body.name));
  } catch (err) {
    res.status(500);
    return next(err);
  }
});

router.post('/subscribe', async (req, res, next) => {
  try {
    res.json(await streamService.subscribeToStream(req.app, req.body.stream));
  } catch (err) {
    res.status(500);
    return next(err);
  }
});

router.post('/publish', async (req, res, next) => {
  try {
    res.json(await streamService.publishDataToStream(req.app, req.body.stream, req.body.data));
  } catch (err) {
    res.status(500);
    return next(err);
  }
});

module.exports = router;
