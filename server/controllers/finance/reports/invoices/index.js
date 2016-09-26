/**
 * @overview
 * Invoice Reports
 *
 * @description
 * This module contains the functionality to generate invoice reports and
 * receipts.
 *
 * @todo - implement the filtering portion of this.  See patient registrations
 * for inspiration.
 */
'use strict';

const q  = require('q');
const _  = require('lodash');
const util = require('../../../../lib/util');

const ReportManager = require('../../../../lib/ReportManager');
const Invoices      = require('../../patientInvoice');
const Patients      = require('../../../medical/patients');

const RECEIPT_TEMPLATE = './server/controllers/finance/reports/invoices/receipt.handlebars';
const REPORT_TEMPLATE  = './server/controllers/finance/reports/invoices/report.handlebars';

exports.report = report;
exports.receipt = receipt;

/**
 * @function report
 * @desc build a report for invoice patient report of metadata
 * @param {array} data invoice patient report of metadata
 * @return {object} promise
 */
function report(req, res, next) {

  let report;

  try {
    report = new ReportManager(REPORT_TEMPLATE, req.session, req.query);
  } catch (e) {
    return next(e);
  }

  // @todo - this should use a .find() method like patient registratons
  Invoices.listInvoices()
    .then(rows => report.render({ rows }))
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

/** receipt */
function receipt(req, res, next) {
  const options = req.query;

  let invoiceUuid = req.params.uuid;
  let enterpriseId = req.session.enterprise.id;
  let invoiceResponse = {};

  let report;

  try {
    report = new ReportManager(RECEIPT_TEMPLATE, req.session, options);
  } catch (e) {
    return next(e);
  }

  Invoices.lookupInvoice(invoiceUuid)
    .then(reportResult => {
      let recipientUuid = reportResult.patient_uuid;
      _.extend(invoiceResponse, reportResult);

      let queries = {
        recipient : Patients.lookupPatient(recipientUuid)
      };

      return util.resolveObject(queries);
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
