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
 * @requires lib/filter
 * @requires lib/errors/NotFound
 * @requires lib/errors/BadRequest
 */


// npm deps
const q = require('q');
const _ = require('lodash');
const uuid = require('node-uuid');

// module dependencies
const db = require('../../../lib/db');
const FilterParser = require('../../../lib/filter');
const NotFound = require('../../../lib/errors/NotFound');
const BadRequest = require('../../../lib/errors/BadRequest');

// Fiscal Service
const FiscalService = require('../../finance/fiscal');

// expose to the api
exports.list = list;
exports.getTransaction = getTransaction;
exports.reverse = reverse;
exports.find = find;
exports.journalEntryList = journalEntryList;

exports.editTransaction = editTransaction;
exports.count = count;


/**
 * Looks up a transaction by record_uuid.
 *
 * @param {String} record_uuid - the record uuid
 * @returns {Promise} object - a promise resolving to the part of transaction object.
 */
function lookupTransaction(recordUuid) {
  const options = {
    record_uuid : recordUuid,
    includeNonPosted : true,
  };

  return find(options)
    .then((result) => {
      // if no records matching, throw a 404
      if (result.length === 0) {
        throw new NotFound(`Could not find a transaction with record_uuid: ${recordUuid}.`);
      }

      return result;
    });
}

// @TODO(sfount) find a more efficient way of combining multiple table sets than a union all on the final results
//               - new method should be proven as more efficient on large data sets before being accepted
//
// Current merge logic : subset 1 UNION ALL subset 2 ORDER
// 1. select all from the posting journal including all joins, conditions etc.
// 2. select all from the general ledger including all joins, conditions etc.
// 3. UNION ALL between both complete sets of data
// 4. Apply date order
function naiveTransactionSearch(options, includeNonPosted) {
  // hack to ensure only the correct amount of rows are returned - this should be improved
  // in the more efficient method of selection
  let limitCondition = '';
  if (options.limit) {
    limitCondition = ` LIMIT ${Number(options.limit)}`;
  }

  if (!includeNonPosted) {
    const query = buildTransactionQuery(_.cloneDeep(options), false);
    return db.exec(`(${query.sql}) ORDER BY trans_date DESC ${limitCondition}`, query.parameters);
  }

  // clone options as filter parsing process mutates object
  const posted = buildTransactionQuery(_.cloneDeep(options), true);
  const nonPosted = buildTransactionQuery(_.cloneDeep(options), false);

  const combinedParameters = posted.parameters.concat(nonPosted.parameters);

  return db.exec(`(${posted.sql}) UNION ALL (${nonPosted.sql}) ORDER BY trans_date DESC ${limitCondition}`, combinedParameters);
}

// if posted ONLY return posted transactions
// if not posted ONLY return non-posted transactions
function buildTransactionQuery(options, posted) {
  db.convert(options, ['uuid', 'record_uuid']);

  const filters = new FilterParser(options, { tableAlias : 'p', autoParseStatements : false });

  const table = posted ? 'general_ledger' : 'posting_journal';

  const sql = `
    SELECT BUID(p.uuid) AS uuid, ${posted} as posted, p.project_id, p.fiscal_year_id, p.period_id,
      p.trans_id, p.trans_date, BUID(p.record_uuid) AS record_uuid,
      dm1.text AS hrRecord, p.description, p.account_id, p.debit, p.credit,
      p.debit_equiv, p.credit_equiv, p.currency_id, c.name AS currencyName,
      BUID(p.entity_uuid) AS entity_uuid, em.text AS hrEntity,
      BUID(p.reference_uuid) AS reference_uuid, dm2.text AS hrReference,
      p.comment, p.origin_id, p.user_id, p.cc_id, p.pc_id, pro.abbr,
      pro.name AS project_name, per.start_date AS period_start,
      per.end_date AS period_end, a.number AS account_number, a.label AS account_label, u.display_name
    FROM ${table} p
      JOIN project pro ON pro.id = p.project_id
      JOIN period per ON per.id = p.period_id
      JOIN account a ON a.id = p.account_id
      JOIN user u ON u.id = p.user_id
      JOIN currency c ON c.id = p.currency_id
      LEFT JOIN entity_map em ON em.uuid = p.entity_uuid
      LEFT JOIN document_map dm1 ON dm1.uuid = p.record_uuid
      LEFT JOIN document_map dm2 ON dm2.uuid = p.reference_uuid
  `;

  filters.period('period', 'trans_date');
  filters.dateFrom('custom_period_start', 'trans_date');
  filters.dateTo('custom_period_end', 'trans_date');

  filters.fullText('description');
  filters.fullText('comment');

  filters.equals('user_id');
  filters.equals('account_id');
  filters.equals('project_id');
  filters.equals('trans_id');
  filters.equals('origin_id');
  filters.equals('record_uuid');

  filters.custom('amount', '(credit_equiv = ? OR debit_equiv = ?)', [options.amount, options.amount]);

  return {
    sql : filters.applyQuery(sql),
    parameters : filters.parameters(),
  };
}

/**
 * @function find
 *
 * @description
 * This function filters the posting journal by query parameters passed in via
 * the options object.  If no query parameters are provided, the method will
 * return all items in the posting journal
 *
 * includeNonPosted
 * includeAggregates
 */
function find(options) {
  if (options.includeNonPosted && Boolean(Number(options.includeNonPosted))) {
    delete options.includeNonPosted;
    return naiveTransactionSearch(options, true);
  }

  return naiveTransactionSearch(options, false);
}

/**
 * @function journalEntryList
 *
 * Allows you to select which transactions to print
 */
function journalEntryList(options, source) {
  const uuids = options.uuids.map(uid => db.bid(uid));
  const origin = source || 'posting_journal';

  const sql = `
    SELECT BUID(p.uuid) AS uuid, p.project_id, p.fiscal_year_id, p.period_id,
      p.trans_id, p.trans_date, BUID(p.record_uuid) AS record_uuid,
      dm1.text AS hrRecord, p.description, p.account_id, p.debit, p.credit,
      p.debit_equiv, p.credit_equiv, p.currency_id, c.name AS currencyName,
      BUID(p.entity_uuid) AS entity_uuid, em.text AS hrEntity,
      BUID(p.reference_uuid) AS reference_uuid, dm2.text AS hrReference,
      p.comment, p.origin_id, p.user_id, p.cc_id, p.pc_id, pro.abbr,
      pro.name AS project_name, per.start_date AS period_start,
      per.end_date AS period_end, a.number AS account_number, a.label AS account_label, u.display_name
    FROM ${origin} p
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
 * @method list
 *
 * @description
 * This function simply uses the find() method to filter the posting journal and
 * (optionally) the general ledger.
 */
function list(req, res, next) {
  find(req.query)
    .then((journalResults) => {
      return res.status(200).send(journalResults);
    })
    .catch(next)
    .done();
}

/**
 * GET /journal/:record_uuid
 * send back a set of lines which have the same record_uuid the which provided by the user
 */
function getTransaction(req, res, next) {
  lookupTransaction(req.params.record_uuid)
    .then((transaction) => {
      res.status(200).json(transaction);
    })
    .catch(next)
    .done();
}

// @TODO(sfount) move edit transaction code to separate server controller - split editing process
//               up into smaller self contained methods
function editTransaction(req, res, next) {
  const REMOVE_JOURNAL_ROW = 'DELETE FROM posting_journal WHERE uuid = ?';
  const UPDATE_JOURNAL_ROW = 'UPDATE posting_journal SET ? WHERE uuid = ?';
  const INSERT_JOURNAL_ROW = 'INSERT INTO posting_journal SET ?';

  const transaction = db.transaction();
  const recordUuid = req.params.record_uuid;

  const rowsChanged = req.body.changed;
  const rowsAdded = req.body.added;
  const rowsRemoved = req.body.removed;

  let _oldTransaction;
  let transDate;

  rowsRemoved.forEach(row => transaction.addQuery(REMOVE_JOURNAL_ROW, [db.bid(row.uuid)]));

  // verify that this transaction is NOT in the general ledger already
  // @FIXME(sfount) this logic needs to be updated when allowing super user editing
  lookupTransaction(recordUuid)
    .then((oldTransaction) => {
      const posted = oldTransaction[0].posted;

      // bind the current transaction under edit as "oldTransaction"
      _oldTransaction = oldTransaction;

      // check the source (posted vs. non-posted) of the first transaction row
      if (posted) {
        throw new BadRequest('Posted transactions cannot be edited', 'POSTING_JOURNAL.ERRORS.TRANSACTION_ALREADY_POSTED');
      }

      // make sure that the user tools cannot simply remove all rows without going through
      // the deletion API
      if (rowsAdded.length === 0 && rowsRemoved.length >= oldTransaction.length) {
        throw new BadRequest('The editing API cannot remove all rows in a transaction', 'POSTING_JOURNAL.ERRORS.TRANSACTION_MUST_CONTAIN_ROWS');
      }

      // continue with editing - transform requested additional columns
      return transformColumns(rowsAdded, true, _oldTransaction);
    })
    .then((result) => {
      result.forEach((row) => {
        db.convert(row, ['uuid', 'record_uuid', 'entity_uuid']);
        // row = transformColumns(row);
        transaction.addQuery(INSERT_JOURNAL_ROW, [row]);
      });      

      return pickTransDate(rowsChanged);
    })
    .then((trans_date) => {
      transDate = trans_date;
      return FiscalService.lookupFiscalYearByDate(transDate);
    })
    .then((result) => {
      if (transDate) {
        if (!result.length) {
          throw new BadRequest('Invalid Fiscal Year', 'POSTING_JOURNAL.ERRORS.NO_FISCAL_FOR_DATE');
        }

        if (result[0].locked) {
          throw new BadRequest('Closed Fiscal Year', 'POSTING_JOURNAL.ERRORS.CLOSED_FISCAL_YEAR');
        }
      }
      
      return transformColumns(rowsChanged, false, _oldTransaction, result);
    })
    .then((result) => {
      _.each(result, (row, uid) => {
        db.convert(row, ['entity_uuid']);
        transaction.addQuery(UPDATE_JOURNAL_ROW, [row, db.bid(uid)]);
      });
      return transaction.execute();
    })
    .then(() => {
      // transaction changes written successfully - return latest version of transaction
      return lookupTransaction(recordUuid);
    })
    .then((updatedRows) => {
      res.status(200).json(updatedRows);
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
function transformColumns(rows, newRecord, oldTransaction, setFiscalData) {
  const ACCOUNT_NUMBER_QUERY = 'SELECT id FROM account WHERE number = ?';
  const ENTITY_QUERY = 'SELECT uuid FROM entity_map WHERE text = ?';
  const REFERENCE_QUERY = 'SELECT uuid FROM document_map  WHERE text = ?';
  const EXCHANGE_RATE_QUERY = `
    SELECT ? * IF(enterprise.currency_id = ?, 1, GetExchangeRate(enterprise.id, ?, ?)) AS amount FROM enterprise
    JOIN project ON enterprise.id = project.enterprise_id WHERE project.id = ?;
  `;

  // these are global/shared properties of the current transaction
  // TODO(@jniles) - define these shared properties in an isomorphic way to share between
  // client and server.
  const projectId = oldTransaction[0].project_id;
  const transactionDate = oldTransaction[0].trans_date;
  const currencyId = oldTransaction[0].currency_id;

  const databaseRequests = [];
  const databaseValues = [];
  const assignments = [];

  let promises = [];

  // this works on both the object provided from changes and the array from new
  // rows - that might be a hack
  _.each(rows, (row) => {
    // supports specific columns that can be edited on the client
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

        _.extend(row, { account_id : result[0].id });
        return result;
      });

      delete row.account_number;
    }

    if (row.account_name) {
      delete row.account_name;
    }

    if (row.account_label) {
      delete row.account_label;
    }

    if (row.hrEntity) {
      // reverse barcode lookup entity
      databaseRequests.push(ENTITY_QUERY);
      databaseValues.push([row.hrEntity]);

      assignments.push((result) => {
        if (!result.length) {
          throw new BadRequest('Invalid entity for journal rows', 'POSTING_JOURNAL.ERRORS.EDIT_INVALID_ENTITY');
        }

        _.extend(row, { entity_uuid : result[0].uuid });
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

    // NOTE: To update the amounts, we need to have the enterprise_id, currency_id, and date.
    // These are attained from the old transaction (oldTransaction) or the changed transaction.

    if (row.debit_equiv) {
      // if the date has been updated, use the new date - otherwise default to the old transaction date
      const transDate = new Date(row.trans_date ? row.trans_date : transactionDate);

      databaseRequests.push(EXCHANGE_RATE_QUERY);
      databaseValues.push([row.debit_equiv, currencyId, currencyId, transDate, projectId]);

      assignments.push((result) => {
        const [{ amount }] = result;

        if (!amount) {
          throw new BadRequest(
            'Missing or corrupt exchange rate for rows',
            'POSTING_JOURNAL.ERRORS.MISSING_EXCHANGE_RATE'
          );
        }

        row.debit = amount;
      });
    }

    if (row.credit_equiv) {
      // if the date has been updated, use the new date - otherwise default to the old transaction date
      const transDate = new Date(row.trans_date ? row.trans_date : transactionDate);

      databaseRequests.push(EXCHANGE_RATE_QUERY);
      databaseValues.push([row.credit_equiv, currencyId, currencyId, transDate, projectId]);

      assignments.push((result) => {
        const [{ amount }] = result;

        if (!amount) {
          throw new BadRequest(
            'Missing or corrupt exchange rate for rows',
            'POSTING_JOURNAL.ERRORS.MISSING_EXCHANGE_RATE'
          );
        }
        row.credit = amount;
      });
    }

    // ensure date strings are processed correctly
    // @TODO standardise formatting vs. lookup behaviour
    if (row.trans_date) { 
      row.trans_date = new Date(row.trans_date);

      // Assign the fiscal year value and the period each time the trans_date Change
      row.fiscal_year_id = setFiscalData[0].fiscal_year_id;
      row.period_id = setFiscalData[0].id;
    }
  });

  promises = databaseRequests.map((request, index) =>
    db.exec(request, databaseValues[index])
      .then(results => assignments[index](results))
  );

  return q.all(promises)
    .then(() => rows);
}

//Pick trans_date
function pickTransDate(rows){
  let transDate;
  
  _.each(rows, (row) => {
    transDate = row.trans_date;
  });

  return transDate;
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
  const recordUuid = db.bid(req.params.uuid);
  const params = [
    recordUuid,
    req.session.user.id,
    req.body.description,
    db.bid(voucherUuid),
  ];

  /**
   * Check already cancelled
   * Transaction type for cancelled operation is 10
   */
  const CANCELLED_ID = 10;
  const query = `
    SELECT uuid FROM voucher
    WHERE voucher.type_id = ${CANCELLED_ID} AND voucher.reference_uuid = ?
  `;

  // create and execute a transaction if necessary
  db.exec(query, [recordUuid])
    .then((rows) => {
      if (rows.length > 0) {
        // transaction already cancelled
        throw new BadRequest(
          'The transaction has been already cancelled', 'POSTING_JOURNAL.ERRORS.MULTIPLE_CANCELLING'
        );
      }
      return db.exec('CALL ReverseTransaction(?, ?, ?, ?);', params);
    })
    .then(() => res.status(201).json({ uuid : voucherUuid }))
    .catch(next)
    .done();
}

/**
 * GET /JOURNAL/COUNT
 * Getting the number of transaction from the posting journal
 *
 */
function count(req, res, next) {
  const sql = `
    SELECT COUNT(DISTINCT posting_journal.trans_id) AS number_transactions FROM posting_journal;
  `;

  db.exec(sql)
    .then((rows) => {
      res.status(200).send(rows);
    })
    .catch(next);
}
