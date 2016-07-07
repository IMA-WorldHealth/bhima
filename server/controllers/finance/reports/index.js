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

    /** @todo - make this voucher receipt be exposed in this method */
    voucher: require('./voucher.receipt')
  }
};
