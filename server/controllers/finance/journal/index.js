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
const journal = require('../journal/voucher');

// expose to the api
exports.list = list;

exports.reverse = reverse;


// Create Reverse Transaction for Credit Note
function createReverseTransaction(uid, userId, creditNote) {

  let transaction = db.transaction();

  let sql = `
    SELECT p.uuid, p.project_id, p.fiscal_year_id, p.period_id,
      p.trans_id, p.trans_date, p.record_uuid, p.description, p.account_id, p.debit,
      p.credit, p.debit_equiv, p.credit_equiv, p.currency_id, p.entity_uuid,
      p.entity_type, p.reference_uuid, p.comment, p.origin_id, p.user_id, p.cc_id, p.pc_id
    FROM posting_journal AS p 
    WHERE p.record_uuid = ?;
  `;

  // execute the query
  return db.exec(sql, [uid])
  .then(transactions => {
    var voucher = [],
      voucherItems = [],
      vuid = db.bid(uuid.v4()),
      items;  

    transactions.forEach(function (transaction) {      
      if(transaction.entity_type === 'D'){
        voucher = {
          uuid          : vuid,
          date          : new Date(),
          project_id    : transaction.project_id,
          currency_id   : transaction.currency_id,
          amount        : transaction.debit,
          description   : creditNote.description,
          user_id       : userId,
          type_id         : creditNote.type_id,
          reference_uuid  : uid
        };
      }

      items = [
        db.bid(uuid.v4()), 
        transaction.account_id, 
        transaction.credit, 
        transaction.debit, 
        transaction.entity_uuid, 
        vuid
      ];
      voucherItems.push(items); 
    });   

    // build the SQL query
    transaction
      .addQuery('INSERT INTO voucher SET ?', [ voucher ])
      .addQuery('INSERT INTO voucher_item (uuid, account_id, debit, credit, entity_uuid, voucher_uuid) VALUES ?', [ voucherItems ]);

    return journal(transaction, voucher.uuid)
    .catch(core.handler);
  });
}

/**
 * GET /journal
 * Grtting data from the posting journal
 */
function list(req, res, next) {
  // JOIN fiscal_year f ON f.id = p.fiscal_year_id
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
      a.number AS account_number, u.display_name
    FROM posting_journal p
      JOIN project pro ON pro.id = p.project_id
      JOIN period per ON per.id = p.period_id
      JOIN account a ON a.id = p.account_id
      JOIN user u ON u.id = p.user_id
    ORDER BY p.trans_date DESC;
    `;

  db.exec(sql)
  .then(rows => {
    res.status(200).json(rows);
  })
  .catch(next);
}

/**
 * POST /journal/:UUID/reverse
 * Reverse any transaction in the posting_journal
 */
function reverse(req, res, next) {
  const uid = db.bid(req.params.uuid); 
  var userId = req.session.user.id;

  createReverseTransaction(uid, userId, req.body)
  .then(function (record) {

    res.status(201).json(record);
  })
  .catch(next)
  .done();

}