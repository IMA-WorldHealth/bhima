'use strict';

const q = require('q');
const path = require('path');
const BadRequest = require('./errors/BadRequest');
const supportedRender = {
  json : require('./renderers/json'),
  html : require('./renderers/html'),
  pdf  : require('./renderers/pdf')
};

const defaultRender = 'pdf';
const defaultOptions = { pageSize : 'A4', orientation: 'landscape' };
const contentType = {
  'pdf'  : '"Content-Type" : "application/pdf"',
  'html' : '"Content-Type" : "application/html"',
  'json' : '"Content-Type" : "application/json"'
};

// export the receipt object
exports.build = build;

/**
 * @function build
 * @desc build a report for inventory list of metadata
 * @param {array} data inventory list of metadata
 * @param {object} request the request which contains the renderer type (pdf, json, html, ...)
 * @param {string} templateUrl the handlebars template url for the report
 * @param {object} options the report page options
 * @return {object} resolve An object which contains variables for the handlebars file
 * NOTE: the returned data are get by a spread(document, headers) function
 * and the result is sended with res.set(headers).send(document)
 */
function build(req, data, templateUrl, options) {
  'use strict';

  // The model to send to the view template
  let model = {
    lang : req.query.lang,
    enterprise : req.session.enterprise,
    project : req.session.project,
    data : data
  };

  /*
   * the template url is like this :
   * './server/controllers/stock/inventory/receipts/list.handlebars'
   */
  let template = path.normalize(templateUrl);
  let queryString  = req.query;
  let renderTarget = (queryString && queryString.renderer) ? queryString.renderer : defaultRender;
  let renderer     = supportedRender[renderTarget];
  let pageOptions  = options || defaultOptions;

  // header configurations
  let headerKey = queryString.renderer || 'pdf';
  let headers = contentType[headerKey];

  if (!renderer) {
    throw new BadRequest('Render target provided is invalid or not supported by this report '.concat(renderTarget));
  }

  const report = renderer.render({ model }, template, pageOptions);

  return q.all([report, headers]);
}
