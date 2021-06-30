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
async function build(req, res, next) {
  const options = req.query;

  try {
    const report = new ReportManager(template, req.session, options);

    // format the receipt and ship it off to the client
    const purchase = await Purchases.lookup(req.params.uuid);
    purchase.total_cost = purchase.cost + purchase.shipping_handling;
    report.currency_id = purchase.currency_id;
    const result = await report.render({ purchase });
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}

module.exports = build;
