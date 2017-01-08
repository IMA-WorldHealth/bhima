'use strict';

/**
 * @overview
 * Cash Reports
 *
 * This module is responsible for rendering reports of cash payments.  It supports
 * the cash receipt.
 *
 * @todo - cash payments registry.
 *
 * @module finance/reports/cash
 */

const _    = require('lodash');
const q    = require('q');
const moment = require('moment');

const BadRequest = require('../../../../lib/errors/BadRequest');
const ReportManager = require('../../../../lib/ReportManager');

const pdf = require('../../../../lib/renderers/pdf');

const CashPayments = require('../../cash');
const Debtors = require('../../debtors');
const Exchange = require('../../exchange');
const Users = require('../../../admin/users');
const Patients = require('../../../medical/patients');
const Enterprises = require('../../../admin/enterprises');

const RECEIPT_TEMPLATE = './server/controllers/finance/reports/cash/receipt.handlebars';
const POS_RECEIPT_TEMPLATE = './server/controllers/finance/reports/cash/receipt.pos.handlebars';
const REPORT_TEMPLATE = './server/controllers/finance/reports/cash/report.handlebars';

/**
 * @method receipt
 *
 * @description
 * This method builds the cash payment receipt as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/cash/:uuid
 */
function receipt(req, res, next) {
  const options = req.query;

  let report;

  let template = RECEIPT_TEMPLATE;

  if (Boolean(Number(options.posReceipt))) {
    template = POS_RECEIPT_TEMPLATE;
    _.extend(options, pdf.posReceiptOptions);
  }


  // set up the report with report manager
  try {
    report = new ReportManager(template, req.session, options);
  } catch (e) {
    return next(e);
  }

  const data = {};

  CashPayments.lookup(req.params.uuid)
    .then(payment => {
      data.payment = payment;

      // lookup balances on all invoices
      let invoices = payment.items.map(invoices => invoices.invoice_uuid);

      return q.all([
        Users.lookup(payment.user_id),
        Patients.lookupByDebtorUuid(payment.debtor_uuid),
        Enterprises.lookupByProjectId(payment.project_id),
        Debtors.invoiceBalances(payment.debtor_uuid, invoices)
      ]);
    })
    .spread((user, patient, enterprise, invoices) => {
      _.assign(data, { user, patient, enterprise, invoices });
      return Exchange.getExchangeRate(enterprise.id, data.payment.currency_id, data.payment.date);
    })
    .then(exchange => {
      data.rate = exchange.rate;
      data.currentDateFormatted = (new moment()).format('L');
      data.hasRate = (data.rate && !data.payment.is_caution);

      data.balances = data.invoices.reduce((aggregate, invoice) => {
        aggregate[invoice.uuid] = invoice.balance;
        return aggregate;
      }, {});

      data.payment.items.forEach(invoiceItem => {
        invoiceItem.balance = data.balances[invoiceItem.invoice_uuid];

        // if the payment is anything other than the enterprise rate, exchange it
        // @todo perform ALL exchanges in a standard library
        invoiceItem.exchangedBalance = data.hasRate ? _.round(invoiceItem.balance * data.rate) : invoiceItem.balance;
        invoiceItem.payment_complete = invoiceItem.balance === 0;
      });

      return report.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

/**
 * @method report
 *
 * @description
 * This method builds the cash payment report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/finance/cash
 */
function report(req, res, next) {
  let options = {};
  let display = {};
  let hasFilter = false;

  let report;
  let lang = req.query.lang;
  let enterprise = req.session.enterprise;

  // set up the report with report manager
  try {
    if (req.query.identifiers && req.query.display) {
      options = JSON.parse(req.query.identifiers);
      display = JSON.parse(req.query.display);
      hasFilter = Object.keys(display).length > 0;
    }

    report = new ReportManager(REPORT_TEMPLATE, req.session, req.query);
  } catch (e) {
    return next(e);
  }

  CashPayments.listPayment(options)
    .then(rows => {

      // sum the currencies in each
      const aggregates = rows.reduce(function (totals, row) {

        // make sure a total exists
        totals[row.currency_id] = totals[row.currency_id] || 0;

        // add on to the total the amount in the row
        totals[row.currency_id] += row.amount;

        return totals;
      }, {});

      const data = { rows, display, hasFilter, enterprise, aggregates };

      return report.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

exports.receipt = receipt;
exports.report = report;
