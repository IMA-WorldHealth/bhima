const _ = require('lodash');
const ReportManager = require('../../../../lib/ReportManager');
const db = require('../../../../lib/db');
const util = require('../../../../lib/util');

// path to the template to render
const TEMPLATE = './server/controllers/finance/reports/unbalanced_invoice_payments/report.handlebars';

const DEFAULT_OPTIONS = {
  footerRight : '[page] / [toPage]',
  footerFontSize : '7',
  filename : 'REPORT.UNBALANCED_INVOICE_PAYMENTS_REPORT',
};

exports.document = build;

function build(req, res, next) {
  const qs = _.extend(req.query, DEFAULT_OPTIONS);

  const metadata = _.clone(req.session);

  let report;
  try {
    report = new ReportManager(TEMPLATE, metadata, qs);
  } catch (e) {
    return next(e);
  }

  const { dateFrom, dateTo } = req.query;
  return getBalances(req.query)
    .then(result => {
      const data = _.extend({}, result, { dateFrom, dateTo });
      return report.render(data);
    })
    .then((compiledReport) => {
      res.set(compiledReport.headers).send(compiledReport.report);
    })
    .catch(next);
}

// invoice payements balance
async function getBalances(options) {
  const params = [
    new Date(options.dateFrom),
    new Date(options.dateTo),
  ];

  const paymentBalanceSql = 'CALL UnbalancedInvoicePayments(?, ?);';
  const [invoices] = await db.exec(paymentBalanceSql, params);

  let _0 = 0;
  let _0_25 = 0;
  let _25_50 = 0;
  let _50_75 = 0;
  let _75_100 = 0;
  let more = 0;

  function classifyPercentPaid(inv) {
    const { paymentPercentage } = inv;
    if (paymentPercentage === 0.00) {
      _0++;
    } else if (paymentPercentage > 0 && paymentPercentage < 0.25) {
      _0_25++;
    } else if (paymentPercentage >= 0.25 && paymentPercentage < 0.50) {
      _25_50++;
    } else if (paymentPercentage >= 0.50 && paymentPercentage < 0.75) {
      _50_75++;
    } else if (paymentPercentage >= 0.75 && paymentPercentage < 1) {
      _75_100++;
    } else {
      more++;
    }
  }

  function sumInvoices(group) {
    let [debits, credits, balances] = [0, 0, 0];
    let i = group.length;

    while (i--) {
      const iv = group[i];
      debits += iv.debit;
      credits += iv.credit;
      balances += iv.balance;

      // count the percent paid in each category
      classifyPercentPaid(iv);

      // this is cheeky: add 'title' property array for handlebars rendering
      group.title = `${iv.debtorReference} - ${iv.debtorName}`;
    }

    return [
      util.roundDecimal(debits, 4),
      util.roundDecimal(credits, 4),
      util.roundDecimal(balances, 4),
    ];
  }

  // invoice groups
  const groups = _.groupBy(invoices, 'debtorReference');

  const totals = {
    debit : 0,
    credit : 0,
    balance : 0,
    numInvoices : 0,
  };

  // run all calculations on dataset.
  _.forEach(groups, (group) => {
    const [sumDebit, sumCredit, sumBalance] = sumInvoices(group);

    // calculate the percentage paid for the group
    const percentage = sumCredit / sumDebit;

    // compute the number of invoices
    const numInvoices = group.length;

    totals.debit += sumDebit;
    totals.credit += sumCredit;
    totals.balance += sumBalance;
    totals.numInvoices += numInvoices;

    // attach the totals of each group to the group array
    group.totals = {
      sumDebit, sumCredit, sumBalance, percentage, numInvoices,
    };
  });

  const intervals = {
    _0 : { value : _0, percentage : _0 / totals.numInvoices },
    _0_25 : { value : _0_25, percentage : _0_25 / totals.numInvoices },
    _25_50 : { value : _25_50, percentage : _25_50 / totals.numInvoices },
    _50_75 : { value : _50_75, percentage : _50_75 / totals.numInvoices },
    _75_100 : { value : _75_100, percentage : _75_100 / totals.numInvoices },
    more : { value : more, percentage : more / totals.numInvoices },
  };

  return {
    groups, totals, intervals,
  };
}
