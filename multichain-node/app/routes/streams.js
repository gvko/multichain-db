'use strict';

const express = require('express');
const router = express.Router();

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
router.get('/:streamName/items', function (req, res, next) {
  const streamName = req.params.streamName;
  const count = req.query.count || undefined;

  if (!streamName) {
    return res.json(new Error('Stream name must be provided.'));
  }
  if (count !== undefined && !RegExp('^[0-9]+$').test(req.query.count)) {
    return res.json(new Error('Count param must be an integer.'));
  }

  return app.multichain.listStreamItemsPromise({ stream: streamName, count })
    .then(items => {
      items.forEach(item => {
        item.data = JSON.parse(hexToStr(item.data));
      });

      res.json({ count: items.length, data: items })
    })
    .catch(err => {
      console.error(err);
      res.json(err);
    });
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
  const stream = req.body.stream;
  const key = req.body.key;
  const value = req.body.value;

  if (!stream) {
    return res.json(new Error('Stream name must be provided.'));
  }
  if (!key) {
    return res.json(new Error('Item key must be provided.'));
  }
  if (!value) {
    return res.json(new Error('Item value must be provided.'));
  }

  const data = strToHex(JSON.stringify(value));

  console.log(`> Publishing new data to stream '${stream}'...`);

  return app.multichain.publishPromise({ stream, key, data })
    .then(data => res.json(data))
    .catch(err => {
      console.log(`> Stream '${stream}' does not exist. Creating it now...`);

      return app.multichain.createPromise({ type: 'stream', name: stream, open: true })
        .then(() => {
          console.log(`> Publishing new data to newly created stream '${stream}'...`);

          return app.multichain.publishPromise({ stream, key, data })
        })
        .then(data => res.json(data))
        .catch(err => {
          console.error(err);
          res.json(err);
        });
    });
});

function strToHex(str) {
  let hex = '';

  for (let i = 0; i < str.length; i++) {
    hex += '' + str.charCodeAt(i).toString(16);
  }

  return hex;
}

function hexToStr(hexStr) {
  return new Buffer.from(hexStr, 'hex');
}

module.exports = router;
