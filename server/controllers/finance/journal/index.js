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
const core = require('./core');
const uuid = require('node-uuid');

// expose to the api
exports.list = list;

exports.reverse = reverse;


// GET /Grade
function lookReverseTransaction(uid, user_id) {
  'use strict';

  let transaction = db.transaction();


  let sql = `
    INSERT INTO posting_journal (uuid, project_id, fiscal_year_id, period_id,
      trans_id, trans_date, record_uuid, description, account_id, debit,
      credit, debit_equiv, credit_equiv, currency_id, entity_uuid,
      entity_type, reference_uuid, comment, origin_id, user_id, cc_id, pc_id)
    SELECT
      HUID(UUID()), p.project_id, @fiscalId, @periodId, @transId, p.trans_date,
      p.record_uuid, 'Credit Note', p.account_id, p.credit, p.debit,
      p.credit * @exchange, p.debit * @exchange, p.currency_id,
      p.entity_uuid, 'C', p.reference_uuid, NULL, 1, p.user_id, NULL, NULL
    FROM posting_journal AS p
    WHERE p.record_uuid = ?;`;

  transaction

    // set up the SQL variables for core.js to consume
    .addQuery(`
      SELECT posting_journal.trans_date, enterprise.id, project.id, posting_journal.currency_id
      INTO @date, @enterpriseId, @projectId, @currencyId
      FROM posting_journal JOIN project JOIN enterprise ON
        posting_journal.project_id = project.id AND
        project.enterprise_id = enterprise.id
      WHERE posting_journal.record_uuid = ? LIMIT 1;
    `, [uid])

    .addQuery(`
      UPDATE invoice SET is_credit_note = 1, credit_note_by = ${user_id} 
      WHERE uuid = ?
    `, [uid]);


  // this function sets up the dates, fiscal year, and exchange rate for this
  // posting session and ensures they all exist before attempting to write to
  // the posting journal.
  core.setup(transaction);

  transaction
    .addQuery(
      sql,[uid]
    );

  return transaction.execute()
    .catch(core.handler);
}

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

/**
 * PUT /journal/:UUID/reverse
 * Reverse any transaction in the posting_journal
 */
function reverse(req, res, next) {
  const uid = db.bid(req.params.uuid); 
  var user_id = req.session.user.id;

  lookReverseTransaction(uid, user_id)
  .then(function (record) {

    res.status(201).json(record);
  })
  .catch(next)
  .done();

}