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
const uuid = require('node-uuid');
const NotFound   = require('../../../lib/errors/NotFound');
const _ = require('lodash');

// expose to the api
exports.list = list;
exports.getTransaction = getTransaction;
exports.reverse = reverse;

/**
 * Looks up a transaction by record_uuid.
 *
 * @param {String} record_uuid - the record uuid
 * @returns {Promise} object - a promise resolving to the part of transaction object.
 */
function lookupTransaction(record_uuid) {

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
      a.number AS account_number, u.display_name AS user
    FROM posting_journal p
      JOIN project pro ON pro.id = p.project_id
      JOIN period per ON per.id = p.period_id
      JOIN account a ON a.id = p.account_id
      JOIN user u ON u.id = p.user_id
    WHERE p.record_uuid = ?
    ORDER BY p.trans_date DESC;
    `;

  return db.exec(sql, [ db.bid(record_uuid) ])
    .then(function (rows) {

      // if no records matching, throw a 404
      if (rows.length === 0) {
        throw new NotFound(`could not find a transaction specified by the record`);
      }

      return rows;
    });
}

// Create Reverse Transaction for Credit Note
function createReverseTransaction(uid, userId, creditNote) {

  let transaction = db.transaction();

  let sql = `
    SELECT p.project_id, p.record_uuid, p.account_id, p.debit,
      p.credit, p.debit_equiv, p.credit_equiv, p.currency_id, p.entity_uuid,
      p.entity_type, p.reference_uuid
    FROM posting_journal AS p
    WHERE p.record_uuid = ?
    UNION
    SELECT g.project_id, g.record_uuid, g.account_id, g.debit,
      g.credit, g.debit_equiv, g.credit_equiv, g.currency_id, g.entity_uuid,
      g.entity_type, g.reference_uuid
    FROM general_ledger AS g
    WHERE g.record_uuid = ?;
  `;

  // execute the query
  return db.exec(sql, [uid, uid])
    .then(transactions => {
      var voucher = [],
        voucherItems = [],
        vuid = db.bid(uuid.v4()),
        items;

      transactions.forEach(function (transaction) {
        if (transaction.entity_type === 'D') {
          voucher = {
            uuid          : vuid,
            date          : new Date(),
            project_id    : transaction.project_id,
            currency_id   : transaction.currency_id,
            amount        : transaction.debit,
            description   : creditNote.description,
            user_id       : userId,
            type_id        : creditNote.type_id,
            reference_uuid : uid
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
        .addQuery('INSERT INTO voucher_item (uuid, account_id, debit, credit, entity_uuid, voucher_uuid) VALUES ?', [ voucherItems ])
        .addQuery('CALL PostVoucher(?);', [ voucher.uuid ]);

      return transaction.execute();
    });
}

/**
 * GET /journal
 * Getting data from the posting journal
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
 * GET /journal/:record_uuid
 * send back a set of lines which have the same record_uuid the which provided by the user
 */
function getTransaction (req, res, next){

  let record_uuid = req.params.record_uuid;

  lookupTransaction(record_uuid)
    .then(function (transaction) {
      res.status(200).json(transaction);
    })
    .catch(next)
    .done();
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


