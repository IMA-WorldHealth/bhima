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
exports.journalEntryList = journalEntryList;

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
        throw new NotFound(`Could not find a transaction with record_uuid ${record_uuid}.`);
      }

      return rows;
    });
}

/**
 * GET /journal
 * Getting data from the posting journal
 */
function list(req, res, next) {

  journalEntryList(req.query)
    .then(rows => {
      res.status(200).json(rows);
    })
    .catch(next);
}

/**
 * @method journalEntryList
 * @description return a list of journal entries
 */
function journalEntryList(params) {
  let uuids = [];
  let conditions = [];
  let whereTransactions;
  let whereDates;

  let sql = `
    SELECT BUID(p.uuid) AS uuid, p.project_id, p.fiscal_year_id, p.period_id,
      p.trans_id, p.trans_date, BUID(p.record_uuid) AS record_uuid,
      dm1.text AS hrRecord, p.description, p.account_id, p.debit, p.credit,
      p.debit_equiv, p.credit_equiv, p.currency_id, c.name AS currencyName,
      BUID(p.entity_uuid) AS entity_uuid, em.text AS hrEntity,
      BUID(p.reference_uuid) AS reference_uuid, dm2.text AS hrReference,
      p.comment, p.origin_id, p.user_id, p.cc_id, p.pc_id, pro.abbr,
      pro.name AS project_name, per.start_date AS period_start,
      per.end_date AS period_end, a.number AS account_number, u.display_name
    FROM posting_journal p
      JOIN project pro ON pro.id = p.project_id
      JOIN period per ON per.id = p.period_id
      JOIN account a ON a.id = p.account_id
      JOIN user u ON u.id = p.user_id
      JOIN currency c ON c.id = p.currency_id
      LEFT JOIN entity_map em ON em.uuid = p.entity_uuid
      LEFT JOIN document_map dm1 ON dm1.uuid = p.record_uuid
      LEFT JOIN document_map dm2 ON dm2.uuid = p.reference_uuid
  `;

  // get only transactions given
  if (params && params.uuids && params.uuids.length) {
    uuids = params.uuids.map(uuid => {
      return db.bid(uuid);
    });
    whereTransactions = ' p.uuid IN (?) ';
  }

  // dates given
  if (params && params.dateFrom && params.dateTo) {
    params.dateFrom = new Date(params.dateFrom);
    params.dateTo = new Date(params.dateTo);
    whereDates = ' DATE(p.trans_date) BETWEEN DATE(?) AND DATE(?) ';
  }

  if (whereDates && whereTransactions) {
    sql += ' WHERE ' + whereDates + ' AND ' + whereTransactions;
    conditions.push(params.dateFrom, params.dateTo, uuids);

  } else if (whereDates && !whereTransactions) {
    sql += ' WHERE ' + whereDates;
    conditions.push(params.dateFrom, params.dateTo);

  } else if (!whereDates && whereTransactions) {
    sql += ' WHERE ' + whereTransactions;
    conditions.push(uuids);
  }

  sql += ' ORDER BY p.trans_date DESC;';
  return db.exec(sql, conditions);
}

/**
 * GET /journal/:record_uuid
 * send back a set of lines which have the same record_uuid the which provided by the user
 */
function getTransaction (req, res, next){
  lookupTransaction(req.params.record_uuid)
    .then(function (transaction) {
      res.status(200).json(transaction);
    })
    .catch(next)
    .done();
}

/**
 * @method reverse
 *
 * @description
 * This is a generic wrapper for reversing any transaction in the posting
 * journal or general ledger.  The
 *
 * POST /journal/:uuid/reverse
 */
function reverse(req, res, next) {

  const voucherUuid = uuid.v4();
  const params = [
    db.bid(req.params.uuid), req.session.user.id, req.body.description,
    db.bid(voucherUuid)
  ];

  // create and execute a transaction
  db.transaction()
    .addQuery('CALL ReverseTransaction(?, ?, ?, ?);', params)
    .execute()
    .then(() => res.status(201).json({ uuid : voucherUuid }))
    .catch(next)
    .done();
}
