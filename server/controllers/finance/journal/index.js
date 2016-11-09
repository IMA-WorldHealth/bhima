/**
 * The /journal HTTP API endpoint
 *
 * @module finance/journal/
 *
 * @description
 * This module is responsible for handling CRUD operations
 * against the `posting journal` table.
 *
 * @requires q
 * @requires lodash
 * @requires node-uuid
 * @requires lib/db
 * @requires lib/errors/NotFound
 * @requires lib/errors/BadRequest
 */

'use strict';

// npm deps
const q = require('q');
const _ = require('lodash');
const uuid = require('node-uuid');

// module dependencies
const db = require('../../../lib/db');
const util = require('../../../lib/util');
const NotFound  = require('../../../lib/errors/NotFound');
const BadRequest = require('../../../lib/errors/BadRequest');

// expose to the api
exports.list = list;
exports.getTransaction = getTransaction;
exports.reverse = reverse;
exports.find = find;

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
 * @function find
 *
 * @description
 * This function filters the posting journal by query parameters passed in via
 * the options object.  If no query parameters are provided, the method will
 * return all items in the posting journal
 */
function find(options) {
  // remove the limit first thing, if it exists
  let limit = Number(options.limit);
  delete options.limit;

  // support flexible queries by keeping a growing list of conditions and
  // statements
  let conditions = {
    statements: [],
    parameters: []
  };

  // if nothing is passed in as an option, throw an error
  if (_.isEmpty(options)) {
    return q.reject(
      new BadRequest('The request requires at least one parameter.', 'ERRORS.PARAMETERS_REQUIRED')
    );
  }

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
    WHERE
      SQL_CONDITIONS
    ORDER BY p.trans_date DESC
  `;

  // filter on a record uuid
  if (options.record_uuid) {
    const recordUuid = db.bid(options.record_uuid);
    conditions.statements.push('p.record_uuid = ?');
    conditions.parameters.push(recordUuid);
    delete options.record_uuid;
  }

  // filter on reference uuid
  if (options.reference_uuid) {
    const referenceUuid = db.bid(options.reference_uuid);
    conditions.statements.push('p.reference_uuid = ?');
    conditions.parameters.push(referenceUuid);
    delete options.reference_uuid;
  }

  // TODO - will this have SQL injection?
  if (options.description) {
    conditions.statements.push(`p.description LIKE "%${options.description}%"`);
    delete options.description;
  }

  // filter on uuid
  if (options.uuid) {
    const id = db.bid(options.uuid);
    conditions.statements.push('p.uuid = ?');
    conditions.parameters.push(id);
    delete options.uuid;
  }

  // filter on min date
  if (options.dateFrom) {
    conditions.statements.push('DATE(p.trans_date) >= ?');
    conditions.parameters.push(new Date(options.dateFrom));
    delete options.dateFrom;
  }

  // filter on max date
  if (options.dateTo) {
    conditions.statements.push('DATE(p.trans_date) <= ?');
    conditions.parameters.push(new Date(options.dateTo));
    delete options.dateTo;
  }

  if (options.comment) {
    conditions.statements.push(`p.comment LIKE "%${options.comment}%"`);
    delete options.comment;
  }

  // this accounts for currency_id, user_id, trans_id, account_id, etc ..

  // assign query parameters as needed
  let { statements, parameters } = util.parseQueryStringToSQL(options, 'p');
  conditions.statements = _.concat(conditions.statements, statements);
  conditions.parameters = _.concat(conditions.parameters, parameters);

  sql = sql.replace('SQL_CONDITIONS', conditions.statements.join(' AND '));

  // finally, apply the LIMIT query
  if (!isNaN(limit)) {
    sql += ' LIMIT ?;';
    conditions.parameters.push(limit);
  }

  return db.exec(sql, conditions.parameters);
}

/**
 * GET /journal
 * Getting data from the posting journal
 */
function list(req, res, next) {

  let promise;

  // TODO - clean this up a bit.  We should only use a single column definition
  // for both this and find()
  if (_.isEmpty(req.query)) {
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
      ORDER BY p.trans_date DESC
    `;

    promise = db.exec(sql);
  } else {
    promise = find(req.query);
  }

  promise
    .then(rows => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
 * GET /journal/:record_uuid
 * send back a set of lines which have the same record_uuid the which provided by the user
 */
function getTransaction (req, res, next) {
  lookupTransaction(req.params.record_uuid)
    .then(transaction => {
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
