/**
 * @overview transactions.js
 *
 * @description
 * This module contains helper functions for operating on transactions.  These
 * helper functions
 *
 * @requires lib/db
 * @requires lib/errors/BadRequest
 *
 * @requires controllers/finance/cash
 * @requires controllers/finance/vouchers
 * @requires controllers/finance/patientInvoice
 */

const db = require('../../lib/db');
const BadRequest = require('../../lib/errors/BadRequest');

const Cash = require('./cash');
const Invoices = require('./patientInvoice');
const Vouchers = require('./vouchers');

// this wraps up the safe deletion methods.
// TODO(@jniles) - move these to the `indentifiers` as suggested by @sfount
const safeDeletionMethods = {
  CP : Cash.safelyDeleteCashPayment,
  IV : Invoices.safelyDeleteInvoice,
  VO : Vouchers.safelyDeleteVoucher,
};

exports.deleteTransaction = deleteTransaction;

/**
 * @function getTransactionReferences
 *
 * @description
 * This function will find the uuids of any transactions that reference the
 * provided transaction's uuid.
 *
 * @param {String} transactionUuid - the record_uuid of the transaction
 */
function getTransactionReferences(transactionUuid) {
  const sql = `
    SELECT DISTINCT uuid, text FROM (
      SELECT dm.uuid, dm.text
      FROM posting_journal AS j JOIN document_map AS dm ON
        j.reference_uuid = dm.uuid
      WHERE j.reference_uuid = ?

      UNION ALL

      SELECT dm.uuid, dm.text
      FROM general_ledger AS g JOIN document_map AS dm ON
        g.reference_uuid = dm.uuid
      WHERE g.reference_uuid = ?
    )c;
  `;

  const buid = db.bid(transactionUuid);

  return db.exec(sql, [buid, buid]);
}

/**
 * @function parseDocumentMapString
 *
 * @description
 * This function parses the document map identifier and returns the safe
 * deletion method associated with this document.
 *
 * @param {String} text - the text of the document map
 *
 * @returns {Function} the safe deletion method associated with the module
 */
function parseDocumentMapString(text) {
  const key = text.split('.').shift();
  return safeDeletionMethods[key];
}

/**
 * @function getTransactionRecords
 *
 * @description
 * Returns the transaction from the posting journal and general_ledger.
 */
function getTransactionRecords(uuid) {
  const sql = `
      SELECT BUID(j.uuid) AS uuid, trans_id, BUID(record_uuid) AS record_uuid,
        trans_date, debit_equiv, credit_equiv, currency_id,
        BUID(reference_uuid) AS reference_uuid,
        BUID(entity_uuid) AS entity_uuid, 0 AS posted,
        document_map.text AS identifier
      FROM posting_journal AS j JOIN document_map ON
        j.record_uuid = document_map.uuid
      WHERE record_uuid = ?

      UNION ALL

      SELECT BUID(j.uuid) AS uuid, trans_id, BUID(record_uuid) AS record_uuid,
        trans_date, debit_equiv, credit_equiv, currency_id,
        BUID(reference_uuid) AS reference_uuid,
        BUID(entity_uuid) AS entity_uuid, 0 AS posted,
        document_map.text AS identifier
      FROM general_ledger AS j JOIN document_map ON
        j.record_uuid = document_map.uuid
      WHERE record_uuid = ?
  `;

  return db.exec(sql, [db.bid(uuid), db.bid(uuid)]);
}


/**
 * @function deleteTransation
 *
 * @description
 * This function is the HTTP handler for the delete transactions route.
 *
 * DELETE /transactions/:uuid
 */
function deleteTransaction(req, res, next) {
  const { uuid } = req.params;
  let transaction;

  // get all the rows of the transaction
  getTransactionRecords(uuid)
    .then(rows => {
      transaction = rows;

      // TODO(@jniles) - i18n
      const isPosted = transaction[0].posted;
      if (isPosted) {
        throw new BadRequest('This transaction is already posted.', 'TRANSACTIONS.ERRORS.TRANSACTION_POSTED');
      }

      // check if the transaction has references elsewhere
      return getTransactionReferences(uuid);
    })
    .then(references => {
      // TODO(@jniles) - i18n
      const isReferenced = references.length > 0;
      if (isReferenced) {
        throw new BadRequest('This transaction is referenced.', 'TRANSACTIONS.ERRORS.TRANSACTION_REFERENCED');
      }

      const documentMapText = transaction[0].identifier;

      // route to do the correct safe deletion method.
      const safeDeleteFn = parseDocumentMapString(documentMapText);

      // run the safe deletion method
      return safeDeleteFn(uuid);
    })
    .then(() => {
      res.sendStatus(201);
    })
    .catch(next)
    .done();
}
