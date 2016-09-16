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
'use strict';

const q           = require('q');
const _           = require('lodash');
const ReportManager = require('../../../lib/ReportManager');

const Invoices    = require('../patientInvoice');
const Patients    = require('../../medical/patients');

const template = './server/controllers/finance/reports/invoice.receipt.handlebars';

exports.build = build;

/**
 * HTTP Request Method
 *
 * Returns a compiled object that adheres to the reports standards
 *
 * Request options:
 * ```
 * {
 *   renderer : {String}  Server core renderer to use; this report supports
 *                        ['pdf', 'json', 'html']
 * }
 * ```
 *
 * ```
 * {
 *   header :             Data relevant to the report header, this includes
 *                        enterprise and recipient data
 *   data   :             Core report data, this includes all relevant invoice data
 *   meta   :             Meta data to do with production of the report
 * }
 */
function build(req, res, next) {
  const options = req.query;

  let invoiceUuid = req.params.uuid;
  let enterpriseId = req.session.enterprise.id;
  let invoiceResponse = {};

  let report;

  try {
    report = new ReportManager(template, req.session, options);
  } catch (e) {
    return next(e);
  }

  Invoices.lookupInvoice(invoiceUuid)
    .then(reportResult => {
      let recipientUuid = reportResult.patient_uuid;
      _.extend(invoiceResponse, reportResult);

      return headerData(recipientUuid);
    })
    .then(headerResult => {
      _.extend(invoiceResponse, headerResult);

      return report.render(invoiceResponse);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

// function headerData
function headerData(patientUuid) {

  /** @todo write utility method to map keys of request object to returned object */
  let headerRequests = {
    recipient : Patients.lookupPatient(patientUuid)
  };

  return q.all(_.values(headerRequests))
    .then(results => {
      var header = {};
       _.keys(headerRequests).forEach((key, index) => header[key] = results[index]);

      return header;
    });
}
