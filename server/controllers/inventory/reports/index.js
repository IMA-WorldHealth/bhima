/**
 * @overview controllers/inventory/reports
 *
 * @description
 * This controller is responsible for aggregating all the inventory reports in a
 * single location for easy access.
 */
module.exports = {
  receipts: {
    purchases: require('./purchases.receipt')
  },
  reports : {
    prices : require('./prices')
  }
};
