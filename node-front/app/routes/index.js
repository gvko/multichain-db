'use strict';

const express = require('express');
const router = express.Router();
const bluebird = require('bluebird');
const repeat = require('repeat');

const Multichain = require('multichain-node');
const multichain = bluebird.promisifyAll(Multichain({
  user: 'multichainrpc',
  pass: 'asdf1234',
  host: process.env.MULTICHAIN_HOST,
  port: 4001
}), { suffix: 'Promise' });

router.get('/get-info', function (req, res, next) {
  return multichain.getInfoPromise()
    .then((data) => res.json(data))
    .catch((err) => res.json(err));
});

router.get('/list-streams', function (req, res, next) {
  return multichain.listStreamsPromise()
    .then((data) => res.json(data))
    .catch((err) => res.json(err));
});

router.get('/list-stream-items', function (req, res, next) {
  return multichain.listStreamItemsPromise({ stream: 'test', count: 999 })
    .then((data) => {
      res.json({ count: data.length, data })
    })
    .catch((err) => res.json(err));
});

router.post('/create-stream', function (req, res, next) {
  return multichain.createPromise({ type: 'stream', name: 'test', open: true })
    .then((data) => res.json(data))
    .catch((err) => console.error(err));
});

router.post('/subscribe', function (req, res, next) {
  return multichain.subscribePromise({ stream: 'test' })
    .then((data) => res.json(data))
    .catch((err) => console.error(err));
});

router.post('/publish', function (req, res, next) {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const key = currentTimestamp.toString();
  const data = currentTimestamp.toString(16);

  const publish = () => {
    return multichain.publishPromise({
      stream: 'test', key, data
    });
  };
  // return repeat(publish)
  //   .every('500', 'milliseconds')
  //   .for('10', 'sec')
  //   .start.now()
  //   .then(() => res.json({ msg: 'done' }))
  //   .catch((err) => console.error(err));

  return multichain.publishPromise({
    stream: 'test', key, data
  })
    .then((data) => res.json(data))
    .catch((err) => console.error(err));
});

module.exports = router;
