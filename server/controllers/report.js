'use strict'

const db = require('../db');

exports.keys = keys;

function keys(req, res, next) {
  console.log('fetching report keys');

  let key = req.params.key;
  let sql = 'SELECT id, key, title_key FROM report WHERE key = ?';

  db.exec(sql, [key])
    .then(function (keyDetail) {
      res.status(200).json(keyDetail);
    })
    .catch(next)
    .done();
}

