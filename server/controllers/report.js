'use strict'

const db = require('../lib/db');

exports.keys = keys;
exports.list = list;

function keys(req, res, next) {
  console.log('fetching report keys');

  let key = req.params.key;

  console.log('using key', key);
    let sql = 'SELECT * FROM report WHERE report_key = ?';

  db.exec(sql, [key])
    .then(function (keyDetail) {
      res.status(200).json(keyDetail);
    })
    .catch(next)
    .done();
}

function list(req, res, next) {

  let reportId = req.params.reportId;

  let sql = 'SELECT saved_report.uuid, `label`, `report_id`, `parameters`, `link`, `timestamp`, `user_id`, user.display_name FROM saved_report left join user on saved_report.user_id = user.id WHERE report_id = ?';

  db.exec(sql, [reportId])
    .then(function (results) {
      res.status(200).json(results);
    })
    .catch(next)
    .done();
}
