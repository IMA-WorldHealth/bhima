/**
* The /journal HTTP API endpoint
*
* @module finance/journal/
*
* @description This module is responsible for handling CRUD operations
* against the `posting journal` table.
*
* @requires lib/db
*/

'use strict';

// module dependencies
const db = require('../../../lib/db');

// expose to the api
exports.list = list;

/**
 * GET /journal
 * Grtting data from the posting journal
 */
function list(req, res, next) {
  let sql = `
    SELECT BUID(p.uuid) AS uuid, p.project_id, p.fiscal_year_id, p.period_id,
      p.trans_id, p.trans_date, BUID(p.record_uuid) AS record_uuid,
      p.description, p.account_id, p.debit, p.credit,
      p.debit_equiv, p.credit_equiv, p.currency_id,
      BUID(p.entity_uuid) AS entity_uuid, p.entity_type,
      BUID(p.reference_uuid) AS reference_uuid, p.comment, p.origin_id,
      p.user_id, p.cc_id, p.pc_id,
      pro.abbr, pro.name AS project_name,
      per.start_date AS period_start, per.end_date AS period_end,
      a.number AS account_number,
      CONCAT(u.first, ' - ', u.last) AS user
    FROM posting_journal p
      JOIN project pro ON pro.id = p.project_id
      JOIN period per ON per.id = p.period_id
      JOIN account a ON a.id = p.account_id
      JOIN user u ON u.id = p.user_id
      JOIN fiscal_year f ON f.id = p.fiscal_year_id
    ORDER BY p.trans_date DESC;
    `;

  db.exec(sql)
  .then(rows => {
    res.status(200).json(rows);
  })
  .catch(next);
}
