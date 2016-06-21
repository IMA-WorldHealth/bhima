'use strict';

const path = require('path');
const BadRequest = require('../../../../lib/errors/BadRequest');

let supportedRender = {
  json : require('../../../../lib/renderers/json'),
  html : require('../../../../lib/renderers/html'),
  pdf  : require('../../../../lib/renderers/pdf')
};

// export the receipt object
exports.build = build;

/**
 * @function build
 * @desc build a report for inventory list of metadata
 * @param {array} data inventory list of metadata
 * @return {object} promise
 */
function build(data, request) {
  'use strict';

  let queryString   = request.query;
  let defaultRender = 'pdf';
  let template = path.normalize('./server/controllers/stock/inventory/receipts/list.handlebars');
  let receiptOptions = { pageSize : 'A4', orientation: 'landscape' };

  let renderTarget = (queryString && queryString.renderer) ? queryString.renderer : defaultRender;
  let renderer     = supportedRender[renderTarget];

  if (!renderer) {
    throw new BadRequest('Render target provided is invalid or not supported by this report '.concat(renderTarget));
  }

  let model = {
    enterprise : request.enterprise,
    project : request.project,
    data : data
  };

  return renderer.render({ model }, template, receiptOptions);
}
