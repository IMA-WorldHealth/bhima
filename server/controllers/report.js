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

const path = require('path');
const fs = require('fs');
const db = require('../lib/db');
const barcode = require('../lib/barcode');
const BadRequest = require('../lib/errors/BadRequest');

exports.keys = keys;
exports.list = list;
exports.sendArchived = sendArchived;
exports.deleteArchived = deleteArchived;

exports.barcodeLookup = barcodeLookup;
exports.barcodeRedirect = barcodeRedirect;

// the global report path
// @TODO This will have to factor in the type of report - report uuid can be looked up in `saved_report` table
const REPORT_PATH = path.resolve(path.join(__dirname, '../reports/'));

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
  let sql = `SELECT * FROM report WHERE report_key = ?;`;

  db.exec(sql, [key])
    .then(function (keyDetail) {
      res.status(200).json(keyDetail);
    })
    .catch(next)
    .done();
}

function fetchReport(uuid) {
  let sql = `
    SELECT BUID(saved_report.uuid) AS uuid, label, report_id, parameters, saved_report.link, timestamp, user_id, user.display_name
    FROM saved_report LEFT JOIN user ON saved_report.user_id = user.id
    WHERE report_id = ?;
  `;

  return db.exec(sql, [uuid]);
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
 * @function lookupArchivedReport
 *
 * @description
 * Finds an archived report by it's UUID.
 *
 * @param {String} uuid - the report's uuid.
 * @returns {Promise} - the report record
 */
function lookupArchivedReport(uuid) {
  let sql = `
    SELECT BUID(saved_report.uuid) as uuid, label, report_id, parameters, link,
      timestamp, user_id, user.display_name
    FROM saved_report left join user on saved_report.user_id = user.id
    WHERE uuid = ?;
  `;
  return db.one(sql, [db.bid(uuid)]);
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
  lookupArchivedReport(req.params.uuid)
    .then(report => {
      res.sendFile(report.link);
    })
    .catch(next)
    .done();
}


/**
 * @function deleteArchived
 *
 * @description
 * Deletes a report from the server.  This cleans up both the record of the
 * report stored in saved_report and the file stored on the disk.
 *
 * DELETE /reports/archive/:uuid
 */
function deleteArchived(req, res, next) {
  let filePath;

  lookupArchivedReport(req.params.uuid)
    .then(report => {
      filePath = report.link;
      return db.exec('DELETE FROM saved_report WHERE uuid = ?;', [ db.bid(req.params.uuid) ]);
    })
    .then(() => {
      fs.unlink(filePath, err => {
        if (err) { return next(err); }
        res.sendStatus(204);
      });
    })
    .catch(next)
    .done();
}

// Method to return the object
// Method to redirect
function barcodeLookup(req, res, next) {
  let key = req.params.key;

  barcode.reverseLookup(key)
    .then(result => res.send(result))
    .catch(next)
    .done();
}

function barcodeRedirect(req, res, next) {
  let key = req.params.key;

  barcode.reverseLookup(key)
    // populated by barcode controller
    .then(result => {
      if (!result._redirectPath) {
        throw new BadRequest('This barcode document does not support redirect');
      }
      res.redirect(result._redirectPath);
    })
    .catch(next)
    .done();
}
