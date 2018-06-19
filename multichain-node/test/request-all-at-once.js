'use strict';

const request = require('../app/node_modules/request-promise');

request({
  method: 'POST',
  uri: 'http://127.0.0.1:9010/streams/publish',
  body: {},
  json: true
});

request({
  method: 'POST',
  uri: 'http://127.0.0.1:9011/streams/publish',
  body: {},
  json: true
});

request({
  method: 'POST',
  uri: 'http://127.0.0.1:9012/streams/publish',
  body: {},
  json: true
});

