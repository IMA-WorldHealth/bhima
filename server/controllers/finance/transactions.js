/**
 * @overview transactions.js
 *
 * @description
 * This module contains the DELETE route for transactions.
 *
 * @requires q
 * @requires lib/db
 * @requires controllers/finance/shared
 * @requires controllers/finance/cash
 * @requires controllers/finance/vouchers
 * @requires controllers/finance/patientInvoice
 */
const q = require('q');

const shared = require('./shared');
const db = require('../../lib/db');

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
exports.commentTransactions = commentTransactions;

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
 * @function deleteTransation
 *
 * @description
 * This function is the HTTP handler for the delete transactions route.
 *
 * DELETE /transactions/:uuid
 */
function deleteTransaction(req, res, next) {
  const { uuid } = req.params;

  shared.getRecordTextByUuid(uuid)
    .then(documentMap => {
      // route to do the correct safe deletion method.
      const safeDeleteFn = parseDocumentMapString(documentMap.text);

      // run the safe deletion method
      return safeDeleteFn(uuid);
    })
    .then(() => {
      res.sendStatus(201);
    })
    .catch(next)
    .done();
}


/**
 * PUT /transactions/comments
 *
 * @function commentTransactions
 *
 * @description
 * This function will put a comment on rows in both the posting journal and
 * general ledger.  To remove the comment, you should just send an empty
 * comment.
 *
 * @param {object} params - { uuids: [...], comment: '' }
 */
function commentTransactions(req, res, next) {
  const { uuids, comment } = req.body.params;
  const uids = uuids.map(db.bid);

  const journalUpdate = 'UPDATE posting_journal SET comment = ? WHERE uuid IN ?';
  const ledgerUpdate = 'UPDATE general_ledger SET comment = ? WHERE uuid IN ?';

  q.all([
    db.exec(journalUpdate, [comment, [uids]]),
    db.exec(ledgerUpdate, [comment, [uids]]),
  ])
    .then(() => {
      res.sendStatus(200);
    })
    .catch(next)
    .done();
}
