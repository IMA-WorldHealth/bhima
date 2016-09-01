/**
 * The /general_ledger HTTP API endpoint
 *
 * @module finance/generalLedger/
 *
 * @description This module is responsible for handling VIEWS (different ways of seeing data) operations
 * against the general ledger table.
 *
 * @requires lib/db
 */

'use strict';

// module dependencies
const db = require('../../../lib/db');

// expose to the api
exports.list = list;

/**
 * GET /general_ledger
 * Getting data from the general ledger
 */
function list(req, res, next) {
  console.log('on est la');

  let sql = `
    SELECT BUID(gl.uuid) AS uuid, gl.project_id, gl.fiscal_year_id, gl.period_id,
      gl.trans_id, gl.trans_date, BUID(gl.record_uuid) AS record_uuid,
      gl.description, gl.account_id, gl.debit, gl.credit,
      gl.debit_equiv, gl.credit_equiv, gl.currency_id,
      BUID(gl.entity_uuid) AS entity_uuid, gl.entity_type,
      BUID(gl.reference_uuid) AS reference_uuid, gl.comment, gl.origin_id,
      gl.user_id, gl.cc_id, gl.pc_id,
      pro.abbr, pro.name AS project_name,
      per.start_date AS period_start, per.end_date AS period_end,
      a.number AS account_number,
      u.display_name AS user
    FROM general_ledger gl
      JOIN project pro ON pro.id = gl.project_id
      JOIN period per ON per.id = gl.period_id
      JOIN account a ON a.id = gl.account_id
      JOIN user u ON u.id = gl.user_id
    ORDER BY gl.trans_date DESC;
    `;

  db.exec(sql)
    .then(function (rows) {
        res.status(200).json(rows);
    })
    .catch(next);
}