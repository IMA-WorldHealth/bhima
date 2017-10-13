/**
 * @overview transactions.js
 *
 * @description
 * This module contains the DELETE route for transactions.
 *
 * @requires controllers/finance/shared
 * @requires controllers/finance/cash
 * @requires controllers/finance/vouchers
 * @requires controllers/finance/patientInvoice
 */

const shared = require('./shared');

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
