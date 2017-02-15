/**
 * @module inventory/controllers/reports/purchase.receipt
 *
 * @description
 * This module is responsible for printing the purchase receipt for a purchase
 * order.
 *
 * @requires lib/ReportManager
 * @requires inventory/purchases
 */

const ReportManager = require('../../../lib/ReportManager');
const Purchases = require('../../finance/purchases');

// path to the template to render
const template = './server/controllers/inventory/reports/purchases.receipt.handlebars';

/**
 * @method build
 *
 * @description
 * This method builds a purchase order receipt using the template defined above.
 * It uses the renderers to implement the rendering as either JSON, HTML, or PDF.
 *
 * GET /reports/inventory/purchases/:uuid
 */
function build(req, res, next) {
  const options = req.query;

  let report;

  try {
    report = new ReportManager(template, req.session, options);
  } catch (e) {
    return next(e);
  }

  // format the receipt and ship it off to the client
  Purchases.lookup(req.params.uuid)
    .then(purchase => report.render({ purchase }))
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

module.exports = build;
