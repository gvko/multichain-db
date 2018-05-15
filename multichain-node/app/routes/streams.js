'use strict';

const express = require('express');
const router = express.Router();
const StreamService = require('../services/StreamService');

/**
 * List all streams
 */
router.get('/list', function (req, res, next) {
  return app.multichain.listStreamsPromise()
    .then(data => res.json(data))
    .catch(err => {
      console.error(err);
      res.json(err);
    });
});

/**
 * List the items of a particular stream, requested by stream name.
 *
 * If count is provided as query param - get up to that number of items. Otherwise, the default amount - 20.
 */
router.get('/:stream/items', function (req, res, next) {
  const stream = req.params.stream;
  const count = req.query.count || undefined;

  if (!stream) {
    return res.json(new Error('Stream name must be provided.'));
  }
  if (count !== undefined && !RegExp('^[0-9]+$').test(req.query.count)) {
    return res.json(new Error('Count param must be an integer.'));
  }

  res.json(StreamService.listStreamItems(stream, count));
});

/**
 * Create a stream with the provided name
 */
router.post('/create', function (req, res, next) {
  const name = req.body.name;

  if (!name) {
    return res.json(new Error('Stream name must be provided.'));
  }

  return app.multichain.createPromise({ type: 'stream', name, open: true })
    .then(data => res.json(data))
    .catch(err => {
      console.error(err);
      res.json(err);
    });
});

/**
 * Subscribe to a stream with the provided name
 */
router.post('/subscribe', function (req, res, next) {
  const name = req.body.name;

  if (!name) {
    return res.json(new Error('Stream name must be provided.'));
  }

  return app.multichain.subscribePromise({ stream: name })
    .then(data => res.json(data))
    .catch(err => {
      console.error(err);
      res.json(err);
    });
});

/**
 * Publish an item to the stream with the provided name
 */
router.post('/publish', function (req, res, next) {
  const name = req.body.name;
  const key = req.body.key;
  const value = req.body.value;

  if (!name) {
    return res.json(new Error('Stream name must be provided.'));
  }
  if (!key) {
    return res.json(new Error('Item key must be provided.'));
  }
  if (!value) {
    return res.json(new Error('Item value must be provided.'));
  }

  const data = strToHex(JSON.stringify(value));
  console.log({
    value,
    data
  });

  return app.multichain.publishPromise({
    stream: name, key, data
  })
    .then(data => res.json(data))
    .catch(err => {
      console.error(err);
      res.json(err);
    });
});


module.exports = router;
