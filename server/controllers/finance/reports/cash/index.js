
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

const _ = require('lodash');
const q = require('q');
const Moment = require('moment');

const ReportManager = require('../../../../lib/ReportManager');

const pdf = require('../../../../lib/renderers/pdf');
const db = require('../../../../lib/db');

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

  let receiptReport;
  let template = RECEIPT_TEMPLATE;

  if (Number(options.posReceipt)) {
    template = POS_RECEIPT_TEMPLATE;
    _.extend(options, pdf.posReceiptOptions);
  }

  // set up the report with report manager
  try {
    receiptReport = new ReportManager(template, req.session, options);
  } catch (e) {
    next(e);
    return;
  }

  const data = {};

  CashPayments.lookup(req.params.uuid)
    .then((payment) => {
      data.payment = payment;

      // create a description for the cash payment's receipt
      const descriptionParts = payment.description.split(' -- ');
      let renderedDescription;

      if (descriptionParts.length > 1) {
        // render everything after the descriptor
        renderedDescription = _.drop(descriptionParts, 1).join('');
      } else {
        // unable to parse ... use the whole description.
        renderedDescription = payment.description;
      }

      payment.renderedDescription = renderedDescription;

      // lookup balances on all invoices
      const invoicesItems = payment.items.map(invoices => invoices.invoice_uuid);

      return q.all([
        Users.lookup(payment.user_id),
        Patients.lookupByDebtorUuid(payment.debtor_uuid),
        Enterprises.lookupByProjectId(payment.project_id),
        Debtors.invoiceBalances(payment.debtor_uuid, invoicesItems),
        Debtors.balance(payment.debtor_uuid),
      ]);
    })
    .spread((user, patient, enterprise, invoices, totalInvoices) => {
      _.assign(data, { user, patient, enterprise, invoices, totalInvoices });
      return Exchange.getExchangeRate(enterprise.id, data.payment.currency_id, data.payment.date);
    })
    .then((exchange) => {
      data.rate = exchange.rate;
      data.currentDateFormatted = (new Moment()).format('L');
      data.hasRate = (data.rate && !data.payment.is_caution);

      data.balances = data.invoices.reduce((aggregate, invoice) => {
        aggregate[invoice.uuid] = invoice.balance;
        return aggregate;
      }, {});

      data.debtorTotalBalance = data.totalInvoices.balance;

      data.payment.items.forEach((invoiceItem) => {
        invoiceItem.balance = data.balances[invoiceItem.invoice_uuid];

        // if the payment is anything other than the enterprise rate, exchange it
        // @todo perform ALL exchanges in a standard library
        invoiceItem.exchangedBalance = data.hasRate ? _.round(invoiceItem.balance * data.rate) : invoiceItem.balance;
        invoiceItem.payment_complete = invoiceItem.balance === 0;
      });

      return receiptReport.render(data);
    })
    .then((result) => {
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
  let reportInstance;
  const query = _.clone(req.query);
  _.extend(query, { filename : 'TREE.CASH_PAYMENT_REGISTRY', csvKey : 'rows' });

  // set up the report with report manager
  try {
    reportInstance = new ReportManager(REPORT_TEMPLATE, req.session, query);
  } catch (e) {
    next(e);
    return;
  }

  // aggregates basic statistics about the selection
  const aggregateSql = `
    SELECT MIN(cash.date) AS minDate, MAX(cash.date) AS maxDate,
      COUNT(DISTINCT(cash.user_id)) AS numUsers,
      COUNT(DISTINCT(cash.project_id)) AS numProjects,
      COUNT(DISTINCT(DATE(cash.date))) AS numDays,
      COUNT(DISTINCT(cash.cashbox_id)) AS numCashboxes,
      COUNT(DISTINCT(cash.debtor_uuid)) AS numDebtors,
      SUM(IF(cash.is_caution, 0, 1)) AS numPayments,
      SUM(cash.is_caution) AS numCautions
    FROM cash
    WHERE cash.uuid IN (?);
  `;

  // aggregates the cost by currency id.
  const costSql = `
    SELECT SUM(cash.amount) AS amount, cash.currency_id, currency.symbol
    FROM cash JOIN currency ON cash.currency_id = currency.id
    WHERE cash.uuid IN (?)
    GROUP BY currency_id;
  `;

  const data = {};
  let uuids;

  CashPayments.listPayment(query)
    .then(rows => {
      data.rows = rows;

      // map the uuids for aggregate sql consumption
      uuids = rows.map(row => db.bid(row.uuid));

      if (!uuids.length) { return false; }

      return db.one(aggregateSql, [uuids]);
    })
    .then(aggregates => {
      data.aggregates = aggregates;

      // conditional switches
      data.hasMultipleProjects = aggregates.numProjects > 1;
      data.hasMultipleCashboxes = aggregates.numCashboxes > 1;

      if (!uuids.length) { return false; }

      return db.exec(costSql, [uuids]);
    })
    .then(amounts => {
      data.amounts = amounts;
      return reportInstance.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

exports.receipt = receipt;
exports.report = report;
