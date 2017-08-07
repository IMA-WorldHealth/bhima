/**
 * @module email-report/report-group
 *
 * @description
 * small description of this module
 *
 * @requires db
 * @requires node-uuid
 * @requires BadRequest
 * @requires NotFound
 */


const uuid = require('node-uuid');
const db = require('../../lib/db');
const Topic = require('../../lib/topic');
const moment = require('moment');

const BadRequest = require('../../lib/errors/BadRequest');
const NotFound = require('../../lib/errors/NotFound');
const Period = require('../../lib/period');

// my report function are definied in the below file
const reports_def = require('../email-report/weeklySummaryReport');
const email_report = require('../email-report/index');


exports.create = create;
exports.update = update;
exports.list = list;
exports.delete = remove;

/**
 * @method create
 *
 * @description

 * POST /email-report API
 */
function create(req, res, next) {

  const sql = 'INSERT INTO report_group (code, name, description) VALUES (?,?,?);';

  var reportGroup = req.body.reportGroup;
  //
  var values = [
    reportGroup.code,
    reportGroup.name,
    reportGroup.description,
  ];


  db.exec(sql, values)
    .then((row) => {
      res.status(201).json(
        { code : reportGroup.code }
      );
    })
    .catch(next)
    .done();
}


/**
 * @method create
 *
 * @description

 * POST /email-report API
 */
function update(req, res, next) {

  const sql = 'UPDATE report_group set code=?, name=?, description=? WHERE code=?;';

  var reportGroup = req.body.reportGroup;
  //
  var values = [
    reportGroup.code,
    reportGroup.name,
    reportGroup.description,
    reportGroup.old_code,
  ];


  db.exec(sql, values)
    .then((row) => {
      res.status(200).json(
        { code: reportGroup.code }
      );
    })
    .catch(next)
    .done();
}


/**
 * @method list
 *
 * @description
 * API /email-report/list-report-group
 */
function list(req, res, next) {

  const sql = `
    SELECT  * FROM report_group WHERE 1;
  `;

  db.exec(sql, {}).then(rows => {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
 * @method delete
 *
 * @description
 * Deletes a single report group   from the database and disk specified by
 * the group code
 *
 * DELETE /report-group/:code
 */
function remove(req, res, next) {

  const code = req.params.code;
  const sql = `
    DELETE FROM report_group WHERE code= ? ;
  `;

  db.exec(sql, [code])
    .then(rows => {
      if (!rows.affectedRows) {
        throw new NotFound(
          `Could not find report group with code ${code}.`
        );
      }

      res.sendStatus(204);
    })
    .catch(next)
    .done();
}

