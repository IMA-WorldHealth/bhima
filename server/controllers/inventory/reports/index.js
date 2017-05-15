/**
 * @overview controllers/inventory/reports
 *
 * @description
 * This controller is responsible for aggregating all the inventory reports in a
 * single location for easy access.
 */

const purchases = require('./purchases.receipt');
const prices = require('./prices');

module.exports = {
  receipts : {
    purchases,
  },
  reports : {
    prices,
  },
};
