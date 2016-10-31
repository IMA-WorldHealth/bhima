/**
 * @module reports
 *
 * @description
 * Controller responsible for exposing data for archived reports. Provides
 * utilities to list details about individual report keys as well as serving
 * archived reports.
 *
 * @requires path
 * @requires fs
 * @requires db
 */
'use strict';

const path = require('path');
const fs = require('fs');
const db = require('../lib/db');

exports.keys = keys;
exports.list = list;
exports.sendArchived = sendArchived;

/**
 * @function keys
 *
 * @description
 * Provide detailed information about an individual archivable report entry.
 * This route is used to drive the generic report page.
 *
 * GET /reports/keys/:key
 */
function keys(req, res, next) {
  let key = req.params.key;
  let sql = 'SELECT * FROM report WHERE report_key = ?';

  db.exec(sql, [key])
    .then(function (keyDetail) {
      res.status(200).json(keyDetail);
    })
    .catch(next)
    .done();
}

/**
 * @function list
 *
 * @description
 * Return a list of all report entries given a specific report key.
 *
 * GET /reports/saved/:reportId
 */
function list(req, res, next) {
  let reportId = req.params.reportId;
  let sql = 'SELECT BUID(saved_report.uuid) as uuid, `label`, `report_id`, `parameters`, `link`, `timestamp`, `user_id`, user.display_name FROM saved_report left join user on saved_report.user_id = user.id WHERE report_id = ?';

  db.exec(sql, [reportId])
    .then(function (results) {
      res.status(200).json(results);
    })
    .catch(next)
    .done();
}

/**
 * @function sendArchived
 *
 * @description
 * Sends a file stored on the server hard disk given a UUID. Report files can
 * be listed with the /reports/saved route.
 *
 * GET /reports/archive/:uuid
 */
function sendArchived(req, res, next) {
  // @TODO This will have to factor in the type of report - report uuid can be looked up in `saved_report` table
  let reportPath = path.resolve(path.join(__dirname, '../reports/'));
  let extension = '.pdf';
  let reportUuid = req.params.uuid;

  res.sendFile(reportPath.concat('/', reportUuid, extension));
}
