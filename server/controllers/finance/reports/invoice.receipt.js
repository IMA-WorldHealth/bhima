/**
 * Invoice Receipt Controller
 *
 * This controller is responsible for collecting information required by a
 * patient invoice receipt. This information is passed to a renderer
 * according the standard report format and returned to the client (based
 * on the clients request).
 *
 * @todo  rename internal lookup method
 *        Invoices.lookupInvoice -> Invoices...
 * @todo  get balance information on the invoice
 * @module finance/reports
 */
const uuid        = require('node-uuid');
const q           = require('q');
const _           = require('lodash');
const path        = require('path');

const db          = require('../../../lib/db');
const NotFound    = require('../../../lib/errors/NotFound');
const BadRequest  = require('../../../lib/errors/BadRequest');

const Invoices    = require('../patientInvoice');
const Patients    = require('../../medical/patients');
const Enterprises = require('../../admin/enterprises');

// currently supports only JSON rendering
const supportedRenderers = {
  json: require('../../../lib/renderers/json'),
  html: require('../../../lib/renderers/html'),
  pdf: require('../../../lib/renderers/pdf')
};

const defaultRender = 'json';

const FLAG_TRUE = 1;
const SUCCESS_STATUS = 200;

const template = path.normalize('./server/controllers/finance/reports/invoice.receipt.handlebars');

exports.build = build;

/**
 * HTTP Request Method
 *
 * Returns a compiled object that adheres to the reports standards
 *
 * Request options:
 * ```
 * {
 *   minimal : {Boolean}  Determine if the report should include header or footer
 *                        information (False)
 *   renderer : {String}  Server core renderer to use; this report supports
 *                        ['pdf', 'json']
 * }
 * ```
 *
 * ```
 * {
 *   header :             Data relevent to the report header, this includes
 *                        enterprise and recipient data
 *   data   :             Core report data, this includes all relevent invoice data
 *   meta   :             Meta data to do with production of the report
 * }
 */
function build(req, res, next) {
  var queryString = req.query;
  var invoiceUuid = req.params.uuid;
  var enterpriseId = req.session.enterprise.id;

  var invoiceResponse = {};

  var renderTarget = queryString.renderer || defaultRender;
  var renderer = supportedRenderers[renderTarget];

  /** @todo delegate to additional method */
  if (_.isUndefined(renderer)) {
    return next(
      new BadRequest(`Render target ${renderTarget} is invalid or not supported by this report.`)
    );
  }

  /** @todo Implement minimal flag */
  //if (queryString.minimal === FLAG_TRUE) {}

  Invoices.lookupInvoice(invoiceUuid)
    .then(function (reportResult) {
      var recipientUuid = reportResult.patient_uuid;
      _.extend(invoiceResponse, reportResult);

      return headerData(recipientUuid, enterpriseId);
    })
    .then(function (headerResult) {
      _.extend(invoiceResponse, headerResult);

      return renderer.render(invoiceResponse, template);
    })
    .then(function (renderedResult) {

      // send the final (rendered) object to the client
      res.set(renderer.headers).send(renderedResult);
      return;
    })
    .catch(next)
    .done();
}

// function headerData
function headerData(patientUuid, enterpriseId) {

  /** @todo write utility method to map keys of request object to returned object */
  var headerRequests = {
    recipient : Patients.lookupPatient(patientUuid),
    enterprise : Enterprises.lookupEnterprise(enterpriseId)
  };

  return q.all(_.values(headerRequests))
    .then(function (results) {
      var header = {};
       _.keys(headerRequests).forEach((key, index) => header[key] = results[index]);

      return header;
    });
}
