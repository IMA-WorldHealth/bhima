/**
* Debtors Controller
*
* This module is responsible for handling crud operations on the debtor
* table.  Currently, this is limited to update (debtors are created in
* association with other entities, such as patients).
*
* There are also some specialized queries such as looking up imbalanced
* invoices, and looking up the balance on a debtor's account.
*
* @module controllers/finance/debtors
*
* @requires lib/db
* @requires lib/errors/NotFound
* @requires lib/errors/BadRequest
*/

'use strict';

const q = require('q');
const db          = require('../../../lib/db');
const uuid        = require('node-uuid');
const NotFound    = require('../../../lib/errors/NotFound');
const BadRequest  = require('../../../lib/errors/BadRequest');

exports.list   = list;
exports.detail = detail;
exports.update = update;
exports.invoices = invoices;
exports.financialPatient = financialPatient;
exports.balance = function() { /** @todo - noop */ };

/**
 * List of debtors
 */
function list(req, res, next) {
  const sql =
    'SELECT BUID(uuid) AS uuid, BUID(group_uuid) AS group_uuid, text FROM debtor;';

  db.exec(sql)
    .then(function (rows) {
      res.status(200).send(rows);
    })
    .catch(next);
}

/*
 * Detail of debtors
 */
function detail(req, res, next) {
  const uid = db.bid(req.params.uuid);

  lookupDebtor(uid)
  .then(function (debtor) {
    res.status(200).json(debtor);
  })
  .catch(next);
}

/**
 * Updates a debtor's details (particularly group_uuid)
 */
function update(req, res, next) {

  var sql =
    'UPDATE debtor SET ? WHERE uuid = ?';

  // delete the uuid if it exists
  delete req.body.uuid;

  // cache the incoming uuid for fast lookups
  const uid = db.bid(req.params.uuid);

  // escape the group_uuid if it exists
  if (req.body.group_uuid) {
    req.body.group_uuid = db.bid(req.body.group_uuid);
  }

  db.exec(sql, [req.body, uid])
  .then(function () {
    return lookupDebtor(uid);
  })
  .then(function (debtor) {
    res.status(200).json(debtor);
  })
  .catch(next)
  .done();
}

/**
 * Find a debtor by their uuid.
 *
 * @param {String} uid - the uuid of the debtor
 * @returns {Promise} promise resolving to the debtor object
 */
function lookupDebtor(uid) {
  const sql = `
    SELECT BUID(uuid) AS uuid, BUID(group_uuid) AS group_uuid, text
    FROM debtor
    WHERE uuid = ?;
  `;

  return db.exec(sql, [db.bid(uid)])
    .then(function (rows) {
      if (!rows.length) {
        throw new NotFound(`Could not find a debtor with uuid ${uuid.unparse(uid)}`);
      }
      return rows[0];
    });
}


/**
 * This function returns all invoices billed to a particular debtor.
 *
 * The algorithm works like this:
 *  1) Look up all invoices billed to that debtor
 *  2) Look up those invoices in the combined ledger, as well as payments
 *    against them.  These are summed into debits and credits.
 *
 * The database will optionally filter invoices based on whether they are
 * balanced (paid off) or not.
 *
 * NOTE - this function is not suitable for reporting, and should only be used
 * by modules that need up-to-the minute debtor status.  There is no control
 * over the dataset queried only the debtor
 *
 * @method invoices
 *
 * @todo - this function should be replaced by an SQL function stored in
 * procedures.sql for easy lookup
 */
function invoices(req, res, next) {
  const uid = db.bid(req.params.uuid);
  const options = req.query;
  const reversalVoucherType = 10;

  // get the debtor invoice uuids from the invoice table
  let sql =`
    SELECT invoice.uuid
    FROM invoice
    WHERE debtor_uuid = ? AND invoice.uuid NOT IN (SELECT voucher.reference_uuid FROM voucher WHERE voucher.type_id = ?);`;

  db.exec(sql, [uid, reversalVoucherType])
    .then(function (uuids) {

      // if nothing found, return an empty array
      if (!uuids.length) { return []; }

      uuids = uuids.map(item => item.uuid);

      let balanced =
         (options.balanced === '1') ? 'HAVING balance = 0' :
         (options.balanced === '0') ? 'HAVING balance <> 0' :
         '';

      // select all invoice and payments against invoices from the combined ledger
      sql = `
        SELECT BUID(i.uuid) AS uuid, CONCAT(project.abbr, invoice.reference) AS reference,
          credit, debit, balance, BUID(entity_uuid) AS entity_uuid, invoice.date
        FROM (
          SELECT uuid, SUM(debit) AS debit, SUM(credit) AS credit, SUM(debit-credit) AS balance, entity_uuid
          FROM (
            SELECT record_uuid AS uuid, debit, credit, entity_uuid
            FROM combined_ledger
            WHERE record_uuid IN (?) AND entity_uuid = ?
          UNION ALL
            SELECT reference_uuid AS uuid, debit, credit, entity_uuid
            FROM  combined_ledger
            WHERE reference_uuid IN (?) AND entity_uuid = ?
          ) AS ledger
          GROUP BY ledger.uuid ${balanced}
        ) AS i
          JOIN invoice ON i.uuid = invoice.uuid
          JOIN project ON invoice.project_id = project.id;
      `;

      return db.exec(sql, [uuids, uid, uuids, uid]);
    })
    .then(function (invoices) {
      res.status(200).json(invoices);
    })
    .catch(next)
    .done();
}

/**
 * This function returns the balance of a debtors account with the hospital.
 *
 * The algorithm works like this:
 *  1) Look up all transaction lines associated with that debtor and sum the
 *  debits and credits.
 *
 * NOTE - this function is not suitable for reporting, and should only be used
 * by modules that need up-to-the minute debtor status.  There is no control
 * over the dataset queried only the debtor
 *
 * @method balance
 *
 * @todo - this function should be replaced by an SQL function stored in
 * procedures.sql for easy lookup
 */
function balance(req, res, next) {
  const uid = db.bid(req.params.uuid);
  var options = req.query;

  // make sure the debtor exists
  var sql =
    'SELECT BUID(uuid) as uuid FROM debtor WHERE uuid = ?;';

  db.exec(sql, [uid])
  .then(function (rows) {

    // if the debtor doesn't exist, throw an error
    if (!rows.length) {
      throw new NotFound(
        `Could not find a debtor with uuid ${req.params.uuid}`
      );
    }

    // select all invoice and payments against invoices from the combined ledger
    sql =
      `SELECT COUNT(*) AS count, SUM(credit - debit) AS balance, BUID(entity_uuid) as entity_uuid
      FROM (
        SELECT record_uuid as uuid, debit, credit
        FROM combined_ledger
        WHERE entity_uuid = ?
      ) AS ledger
      GROUP BY entity_uuid;`;

    return db.exec(sql, [uid, uid]);
  })
  .then(function (invoices) {
    res.status(200).send(invoices);
  })
  .catch(next)
  .done();
}


/**
 * @method financial Patient
 *
 * @description
 * This function allows to know the reports' Patient Financial Activity
 * matching parameters provided in the debtorUuid parameter.
 *
 */

function financialPatient(debtorUuid) {
  const buid = db.bid(debtorUuid);

  // build the main part of the SQL query
  let sql = `
    SELECT transaction.trans_id, transaction.entity_uuid, transaction.description, transaction.trans_date, sum(transaction.credit_equiv) as credit, sum(transaction.debit_equiv) as debit,
    transaction.reference, transaction.abbr
    FROM(
      SELECT posting_journal.trans_id, BUID(posting_journal.entity_uuid) AS entity_uuid, posting_journal.description,
      posting_journal.trans_date, posting_journal.debit_equiv, posting_journal.credit_equiv, invoice.reference, project.abbr
      FROM posting_journal
      LEFT JOIN invoice ON invoice.uuid = posting_journal.record_uuid
      LEFT JOIN project ON invoice.project_id = project.id
      WHERE posting_journal.entity_uuid = ? AND posting_journal.entity_type = 'D'
      UNION
      SELECT general_ledger.trans_id, BUID(general_ledger.entity_uuid) AS entity_uuid, general_ledger.description,
      general_ledger.trans_date, general_ledger.debit_equiv, general_ledger.credit_equiv, invoice.reference, project.abbr
      FROM general_ledger
      LEFT JOIN invoice ON invoice.uuid = general_ledger.record_uuid
      LEFT JOIN project ON invoice.project_id = project.id
      WHERE general_ledger.entity_uuid = ? AND general_ledger.entity_type = 'D'
    ) as transaction
    GROUP BY transaction.trans_id
    ORDER BY transaction.trans_date ASC;`;

  return db.exec(sql, [buid, buid]);
}
