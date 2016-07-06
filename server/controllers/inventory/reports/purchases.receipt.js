/**
 * @module inventory/controllers/reports/purchase.receipt
 *
 * @description
 * This module is responsible for printing the purchase receipt for a purchase
 * order.
 *
 * @requires path
 * @requires lodash
 * @requires BadRequest
 * @requires inventory/purchases
 */

'use strict';

const path = require('path');
const _ = require('lodash');

const BadRequest = require('../../../lib/errors/BadRequest');

const Purchases = require('../../finance/purchases');

// group supported renderers
const renderers = {
  'json': require('../../../lib/renderers/json'),
  'html': require('../../../lib/renderers/html'),
  'pdf': require('../../../lib/renderers/pdf'),
};

// default rendering parameters
const defaults = {
  pageSize: 'A4',
  renderer: 'pdf',
};

// path to the template to render
const template = path.normalize('./server/controllers/inventory/reports/purchases.receipt.handlebars');

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
  const qs = req.query;

  // choose the renderer
  const renderer = renderers[qs.renderer || defaults.renderer];
  if (_.isUndefined(renderer)) {
    throw new BadRequest(`The application does not support rendering ${qs.renderer}.`);
  }

  // delete from the query string
  delete qs.renderer;

  // format the receipt and ship it off to the client
  Purchases.lookup(req.params.uuid)
    .then(purchase => renderer.render({ purchase }, template, defaults))
    .then(result => {
      res.set(renderer.headers).send(result);
    })
    .catch(next)
    .done();
}

module.exports = build;
