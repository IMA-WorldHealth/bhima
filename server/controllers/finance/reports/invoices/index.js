'use strict';

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

const q  = require('q');
const _  = require('lodash');
const util = require('../../../../lib/util');
const moment = require('moment');

const ReportManager = require('../../../../lib/ReportManager');
const Invoices      = require('../../patientInvoice');
const Patients      = require('../../../medical/patients');
const Exchange      = require('../../exchange');

const POS_RECEIPT_TEMPLATE = './server/controllers/finance/reports/invoices/receipt.pos.handlebars';
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

  let metadata = {
    enterprise: req.session.enterprise,
    project: req.session.project,
    user: req.session.user
  };

  let invoiceUuid = req.params.uuid;
  let enterpriseId = req.session.enterprise.id;
  let currencyId = options.currency || req.session.enterprise.currency_id;
  let invoiceResponse = {};

  // @todo - move this is to a constant definition file
  let thermal = {
    // paper width is 80mm - printer seems to cut off 'n'mm at either side
    pageWidth : '72mm',
    pageHeight : '290mm',
    marginLeft : '0mm',
    marginRight : '0mm',
    marginBottom : '0mm',
    marginTop : '0mm'
  };

  let template = RECEIPT_TEMPLATE;

  if (options.posReceipt) {
    template = POS_RECEIPT_TEMPLATE;
    _.extend(options, thermal);
  }

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

      let queries = {
        recipient : Patients.lookupPatient(recipientUuid)
      };

      return util.resolveObject(queries);
    })
    .then(headerResult => {
      _.extend(invoiceResponse, headerResult, metadata);
      return Exchange.getExchangeRate(enterpriseId, currencyId, new Date());
    })
    .then(exchangeResult => {

      invoiceResponse.receiptCurrency = currencyId;
      invoiceResponse.exchange = exchangeResult.rate;
      invoiceResponse.dateFormat = (new moment()).format('L');
      if (invoiceResponse.exchange) {
        invoiceResponse.exchangedTotal = _.round(invoiceResponse.cost * invoiceResponse.exchange);
      }
      return report.render(invoiceResponse);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}
