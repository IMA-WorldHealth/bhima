/**
 * @overview finance/reports
 *
 * @description
 * This module simply exposes the build() methods of the receipts and reports
 * in the finance module.
 */

// expose to the express router
module.exports = {
  receipts : {
    invoices: require('./invoice.receipt').build,
    cash : require('./cash.receipt')
  },
  agedDebtor: require('./agedDebtor'),
  invoices : require('./invoices')
};
