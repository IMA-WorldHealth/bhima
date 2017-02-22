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


// npm deps
const q = require('q');
const _ = require('lodash');
const uuid = require('node-uuid');

// module dependencies
const db = require('../../../lib/db');
const util = require('../../../lib/util');
const NotFound  = require('../../../lib/errors/NotFound');
const BadRequest = require('../../../lib/errors/BadRequest');
const barcode = require('../../../lib/db');

// expose to the api
exports.list = list;
exports.getTransaction = getTransaction;
exports.reverse = reverse;
exports.find = find;
exports.journalEntryList = journalEntryList;

exports.editTransaction = editTransaction;

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
      WHERE p.record_uuid = ?
      ORDER BY p.trans_date DESC
    `;

  return db.exec(sql, [ db.bid(record_uuid) ])
    .then(function (rows) {
      return addAggregateData(rows);
    })
    .then(function (result) {

      // if no records matching, throw a 404
      if (result.journal.length === 0) {
        throw new NotFound(`Could not find a transaction with record_uuid ${record_uuid}.`);
      }

      return result;
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
  let destruct = util.parseQueryStringToSQL(options, 'p');
  conditions.statements = _.concat(conditions.statements, destruct.statements);
  conditions.parameters = _.concat(conditions.parameters, destruct.parameters);

  sql = sql.replace('SQL_CONDITIONS', conditions.statements.join(' AND '));

  // finally, apply the LIMIT query
  if (!isNaN(limit)) {
    sql += ' LIMIT ?;';
    conditions.parameters.push(limit);
  }

  return db.exec(sql, conditions.parameters);
}

/**
* journalEntryList
* Allows you to select which transactions to print
*/
function journalEntryList(options) {
  let uuids =  options.uuids.map(function(uuid) {
    return db.bid(uuid);
  });

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
    WHERE p.uuid IN (?)
    ORDER BY p.trans_date DESC, record_uuid ASC
  `;

  return db.exec(sql, [uuids]);
}


/**
 * GET /journal
 * Getting data from the posting journal
 *
 * optional query flags
 * - aggregates {Boolean} If passed as true querries will return an object with
 *   both requested journal rows as well as aggregate information about all
 *   transactions involved in the request; total credits, debits and row counts.
 */
function list(req, res, next) {

  let promise;

  let includeAggregates = Number(req.query.aggregates);
  delete req.query.aggregates;

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
    .then(function (journalResults) {

      // aggregate information requested - return promise getting this info
      if (includeAggregates) {
        return addAggregateData(journalResults);
      } else {
        // no aggregates required - directly return results
        return journalResults;
      }
    })
    .then(function (rows) {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
 * Wrapper method for requesting and formatting journal rows and aggregate
 * information
 *
 * - returns a correctly formatted object with aggregates and journal rows
 */
function addAggregateData(journalRows) {
  return queryTransactionAggregates(journalRows)
    .then(function (aggregateResults) {
      // format object according to API specification
      return {
        journal : journalRows,
        aggregate : aggregateResults
      };
    });
}

/**
 * Add additional transaction aggregate information based on the transactions/
 * rows in journal querries
 *
 * - Expects an array of journal voucher rows
 *
 * - This one flag returns an object containing both journal rows and aggregate
 *   informaiton, this is described in the API
 */
function queryTransactionAggregates(journalRows) {
  let transactionIds = journalRows
    .map(row => row.record_uuid)
    .filter((transactionId, index, allTransactionIds) => {
      // only keep elements that are unique
      return allTransactionIds.indexOf(transactionId) === index;
    })
    .map(transactionId => db.bid(transactionId));

  let emptyTransactions = transactionIds.length === 0;
  let aggregateQuery = `
    SELECT
      trans_id, SUM(credit_equiv) as credit_equiv, BUID(record_uuid) as record_uuid,
      SUM(debit_equiv) as debit_equiv, COUNT(uuid) as totalRows
    FROM posting_journal
    WHERE record_uuid in (?)
    GROUP BY record_uuid;
  `;

  // if there are no record uuids to search on we can optimise by not running the query
  if (emptyTransactions) {
    return Promise.resolve([]);
  }
  return db.exec(aggregateQuery, [transactionIds]);
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

function editTransaction(req, res, next) {
  const uuid = req.params.record_uuid;

  const REMOVE_JOURNAL_ROW = 'DELETE FROM posting_journal WHERE uuid = ?';
  const UPDATE_JOURNAL_ROW = 'UPDATE posting_journal SET ? WHERE uuid = ?';
  const INSERT_JOURNAL_ROW = 'INSERT INTO posting_journal SET ?';

  let transaction = db.transaction();

  let rowsChanged = req.body.changed;
  let rowsAdded = req.body.added;
  let rowsRemoved = req.body.removed;

  rowsRemoved.forEach((row) => transaction.addQuery(REMOVE_JOURNAL_ROW, [db.bid(row.uuid)]));
  // _.each(rowsChanged, (row, uuid) => transaction.addQuery(UPDATE_JOURNAL_ROW, [row, db.bid(uuid)]));


  transformColumns(rowsAdded, true)
    .then((result) => {
      result.forEach((row) => {
        db.convert(row, ['uuid', 'record_uuid']);
        // row = transformColumns(row);
        transaction.addQuery(INSERT_JOURNAL_ROW, [row]);
      });

      return transformColumns(rowsChanged, false);
    })
    .then((result) => {

      _.each(result, (row, uuid) => transaction.addQuery(UPDATE_JOURNAL_ROW, [row, db.bid(uuid)]));
      return transaction.execute();
    })
    .then((result) => {
      res.status(200).json(result);

    })
    .catch(next);

  // 1. make changes with update methods ('SET ?') etc.
  // 2. run changes through trial balance
  // 3. roll back transaction

  // edit transaction with uuid - uuid
}

// converts all valid posting journal editable columns into data representations
// returns valid errors for incorrect data
// @TODO Many requests are made vs. getting one look up table and using that - this can be greatly optimised
function transformColumns(rows, newRecord) {
  const ACCOUNT_NUMBER_QUERY = 'SELECT id FROM account WHERE number = ?';
  const ENTITY_QUERY = 'SELECT uuid FROM entity_map WHERE text = ?';
  const REFERENCE_QUERY = 'SELECT uuid FROM document_map  WHERE text = ?';

  let databaseRequests = [];
  let databaseValues = [];
  let assignments = [];

  let promises = [];

  // this works on both the object provided from changes and the array from new
  // rows - that might be a hack
  _.each(rows, function (row) {
    // supports specific columns that can be eddited on the client
    // accounts are required on new rows, business logic should be moved elsewhere
    if (newRecord && !row.account_number) {
      throw new BadRequest('Invalid accounts for journal rows', 'POSTING_JOURNAL.ERRORS.EDIT_INVALID_ACCOUNT');
    }

    if (row.account_number) {

      databaseRequests.push(ACCOUNT_NUMBER_QUERY);
      databaseValues.push([row.account_number]);
      assignments.push((result) => {

        if (!result.length) {
          throw new BadRequest('Invalid accounts for journal rows', 'POSTING_JOURNAL.ERRORS.EDIT_INVALID_ACCOUNT');
        }
        row.account_id = result[0].id;
        return result;
      });
      delete row.account_number;
    }

    if (row.hrEntity) {
      // reverse barcode lookup entity
      databaseRequests.push(ENTITY_QUERY);
      databaseValues.push([row.hrEntity]);

      assignments.push((result) => {

        if (!result.length) {
          throw new BadRequest('Invalid entity for journal rows', 'POSTING_JOURNAL.ERRORS.EDIT_INVALID_ENTITY');
        }

        row.entity_uuid = result[0].uuid;
        return result;
      });
      delete row.hrEntity;
    }

    if (row.hrReference) {
      // reverse barcode lookup entity
      databaseRequests.push(REFERENCE_QUERY);
      databaseValues.push([row.hrReference]);

      assignments.push((result) => {

        if (!result.length) {
          throw new BadRequest('Invalid reference for journal rows', 'POSTING_JOURNAL.ERRORS.EDIT_INVALID_REFERENCE');
        }

        row.reference_uuid = result[0].uuid;
        return result;
      });
      delete row.hrReference;
    }

    // in the future this could factor in the currency ID. Right now there is no way
    // of viewing or editing the debit and credit columns on the client
    if (row.debit_equiv) {
      row.debit = row.debit_equiv;
    }

    if (row.credit_equiv) {
      row.credit = row.credit_equiv;
    }

    // ensure date strings are processed correctly
    // @TODO standardise formatting vs. lookup behaviour
    if (row.trans_date) {
      row.trans_date = new Date(row.trans_date);
    }
  });

  promises = databaseRequests.map((request, index) => {
    return db.exec(request, databaseValues[index])
      .then((results) => {
        return assignments[index](results);
      });
  });

  return q.all(promises)
    .then((results) => {
      return rows;
    });
}


/**
 * @method reverse
 *
 * @description
 * This is a generic wrapper for reversing any transaction in the posting
 * journal or general ledger.
 *
 * POST /journal/:uuid/reverse
 */
function reverse(req, res, next) {

  const voucherUuid = uuid.v4();
  const recordUuid  = db.bid(req.params.uuid);
  const params = [ recordUuid, req.session.user.id, req.body.description, db.bid(voucherUuid) ];

  /**
   * Check already cancelled
   * Transaction type for cancelled operation is 10
   */
  const CANCELLED_ID = 10;
  const query =
    `SELECT uuid FROM voucher
     WHERE voucher.type_id = ${CANCELLED_ID} AND voucher.reference_uuid = ?`;

  // create and execute a transaction if necessary
  db.exec(query, [recordUuid])
    .then(rows => {
      if (rows.length > 0) {
        // transaction already cancelled
        throw new BadRequest('The transaction has been already cancelled', 'POSTING_JOURNAL.ERRORS.MULTIPLE_CANCELLING');
      }
      return db.exec('CALL ReverseTransaction(?, ?, ?, ?);', params);
    })
    .then(() => res.status(201).json({ uuid : voucherUuid }))
    .catch(next)
    .done();
}
