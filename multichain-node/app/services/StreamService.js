'use strict';

const multichain = app.multichain;

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

function listStreamItems(stream, count) {

  return multichain.listStreamItemsPromise({ stream, count })
    .then(items => {
      items.forEach(item => {
        item.data = JSON.parse(hexToStr(item.data));
      });

      return Promise.resolve({ count: items.length, data: items });
    })
    .catch(err => {
      console.error(err);
      return Promise.reject(err);
    });
}

function publishItem(stream, key, data) {

}

module.exports = {
  listStreamItems
};
