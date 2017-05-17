
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

const _ = require('lodash');
const util = require('../../../../lib/util');

const Moment = require('moment');

const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');
const Invoices = require('../../patientInvoice');
const Patients = require('../../../medical/patients');
const Exchange = require('../../exchange');

const pdf = require('../../../../lib/renderers/pdf');

const POS_RECEIPT_TEMPLATE = './server/controllers/finance/reports/invoices/receipt.pos.handlebars';
const RECEIPT_TEMPLATE = './server/controllers/finance/reports/invoices/receipt.handlebars';
const REPORT_TEMPLATE = './server/controllers/finance/reports/invoices/report.handlebars';
const CREDIT_NOTE_TEMPLATE = './server/controllers/finance/reports/invoices/creditNote.handlebars';

exports.report = report;
exports.receipt = receipt;
exports.creditNote = creditNote;

/**
 * @function report
 * @desc build a report for invoice patient report of metadata
 * @param {array} data invoice patient report of metadata
 * @return {object} promise
 */
function report(req, res, next) {
  let reportInstance;

  const query = _.clone(req.query);
  _.extend(query, { filename : 'INVOICE_REGISTRY.TITLE', csvKey : 'rows' });

  try {
    reportInstance = new ReportManager(REPORT_TEMPLATE, req.session, query);
  } catch (e) {
    next(e);
    return;
  }

  // This is an easy way to make sure that all the data is captured from any
  // given search without having to parse the parameters.  Just map the UUIDs
  // and then we will use only the values previously used.
  const sql = `
    SELECT MIN(invoice.date) AS minDate, MAX(invoice.date) AS maxDate,
      SUM(invoice.cost) AS amount, COUNT(DISTINCT(user_id)) AS numUsers,
      COUNT(invoice.uuid) AS numInvoices,
      COUNT(DISTINCT(project_id)) AS numProjects,
      COUNT(DISTINCT(DATE(invoice.date))) AS numDays,
      COUNT(DISTINCT(invoice.service_id)) AS numServices
    FROM invoice
    WHERE invoice.uuid IN (?);
  `;

  const data = {};

  Invoices.find(query)
    .then(rows => {
      data.rows = rows;
      const uuids = rows.map(row => db.bid(row.uuid));

      // if no uuids, return false as the aggregates
      if (!uuids.length) { return false; }

      return db.one(sql, [uuids]);
    })
    .then(aggregates => {
      data.aggregates = aggregates;
      data.hasMultipleProjects = aggregates.numProjects > 1;
      return reportInstance.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

/** receipt */
function receipt(req, res, next) {
  const options = req.query;

  const metadata = {
    enterprise : req.session.enterprise,
    project : req.session.project,
    user : req.session.user,
  };

  const invoiceUuid = req.params.uuid;
  const enterpriseId = req.session.enterprise.id;
  const currencyId = options.currency || req.session.enterprise.currency_id;
  const invoiceResponse = {};
  invoiceResponse.lang = options.lang;


  let template = RECEIPT_TEMPLATE;

  if (Boolean(Number(options.posReceipt))) {
    template = POS_RECEIPT_TEMPLATE;
    _.extend(options, pdf.posReceiptOptions);
  }

  let receiptReport;

  try {
    receiptReport = new ReportManager(template, req.session, options);
  } catch (e) {
    next(e);
    return;
  }

  Invoices.lookupInvoice(invoiceUuid)
    .then(reportResult => {
      const recipientUuid = reportResult.patient_uuid;
      _.extend(invoiceResponse, reportResult);

      const queries = {
        recipient : Patients.lookupPatient(recipientUuid),
        creditNote : Invoices.lookupInvoiceCreditNote(invoiceUuid),
      };

      return util.resolveObject(queries);
    })
    .then(headerResult => {
      _.extend(invoiceResponse, headerResult, metadata);

      if (invoiceResponse.creditNote) {
        invoiceResponse.isCreditNoted = true;
        invoiceResponse.creditNoteReference = invoiceResponse.creditNote.reference;
      }

      return Exchange.getExchangeRate(enterpriseId, currencyId, new Date());
    })
    .then(exchangeResult => {
      invoiceResponse.receiptCurrency = currencyId;
      invoiceResponse.exchange = exchangeResult.rate;
      invoiceResponse.dateFormat = (new Moment()).format('L');
      if (invoiceResponse.exchange) {
        invoiceResponse.exchangedTotal = _.round(invoiceResponse.cost * invoiceResponse.exchange);
      }

      return receiptReport.render(invoiceResponse);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

/** credit note */
function creditNote(req, res, next) {
  const options = req.query;

  const metadata = {
    enterprise : req.session.enterprise,
    project : req.session.project,
    user : req.session.user,
  };

  const invoiceUuid = req.params.uuid;
  const enterpriseId = req.session.enterprise.id;
  const currencyId = options.currency || req.session.enterprise.currency_id;
  const invoiceResponse = {};
  invoiceResponse.lang = options.lang;

  const template = CREDIT_NOTE_TEMPLATE;

  let creditNoteReport;

  try {
    creditNoteReport = new ReportManager(template, req.session, options);
  } catch (e) {
    next(e);
    return;
  }

  Invoices.lookupInvoice(invoiceUuid)
    .then(reportResult => {
      const recipientUuid = reportResult.patient_uuid;
      _.extend(invoiceResponse, reportResult);

      const queries = {
        recipient : Patients.lookupPatient(recipientUuid),
        creditNote : Invoices.lookupInvoiceCreditNote(invoiceUuid),
      };

      return util.resolveObject(queries);
    })
    .then(headerResult => {
      _.extend(invoiceResponse, headerResult, metadata);
      return Exchange.getExchangeRate(enterpriseId, currencyId, new Date());
    })
    .then(exchangeResult => {
      invoiceResponse.receiptCurrency = currencyId;
      invoiceResponse.lang = options.lang;
      invoiceResponse.exchange = exchangeResult.rate;
      invoiceResponse.dateFormat = (new Moment()).format('L');
      if (invoiceResponse.exchange) {
        invoiceResponse.exchangedTotal = _.round(invoiceResponse.cost * invoiceResponse.exchange);
      }

      // return Invoices.lookupInvoiceCreditNote(invoiceUuid);
    })
    .then(() => {
      // invoiceResponse.creditNote = creditNoteResult[0];
      return creditNoteReport.render(invoiceResponse);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}
