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
 * If count is provided as query param - get up to that number of items. Otherwise, the default amount of 20.
 */
router.get('/:stream/items', function (req, res, next) {
  const stream = req.params.stream;
  const count = req.query.count || 20;

  if (!stream) {
    return res.json(new Error('Stream name must be provided.'));
  }
  if (!RegExp('^[0-9]+$').test(count)) {
    return res.json(new Error('Count param must be an integer.'));
  }

  console.log(`> Listing the last ${count} items for stream '${stream}'...`);

  const data = [];

  return app.multichain.listStreamItemsPromise({ stream, count })
    .then(items => {
      items.forEach(item => {
        const itemData = JSON.parse(hexToStr(item.data));

        data.push({
          publisher: item.publishers[0],
          timestamp: item.keys[0],
          deviceType: itemData.deviceType,
          measurements: itemData.measurements
        });
      });

      res.json({ count: data.length, data });
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

  console.log(`> Creating stream '${name}'...`);

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
  const bodyData = req.body.newest_data;
  const info = req.body.info;

  const stream = bodyData.device;
  const key = bodyData.timestamp.toString();
  const value = {
    measurements: bodyData.values,
    deviceType: info.substring(info.indexOf('"') + 1, info.lastIndexOf('"'))
  };

  if (!stream) {
    return res.json(new Error('Stream name must be provided.'));
  }
  if (!key) {
    return res.json(new Error('Item key must be provided.'));
  }
  if (!value.measurements) {
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

          return app.multichain.publishPromise({ stream, key, data });
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
