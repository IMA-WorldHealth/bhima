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

  const debtorsSql = `
    SELECT BUID(d.uuid) as uuid, em.text AS reference, d.text
    FROM debtor d
      JOIN invoice i ON i.debtor_uuid = d.uuid
      LEFT JOIN entity_map em ON em.uuid = d.uuid
    WHERE DATE(i.date) BETWEEN DATE(?) AND DATE(?)
  `;

  const paymentBalanceSql = 'CALL UnbalancedInvoicePayments2(?, ?);';

  const promises = await Promise.all([
    db.exec(debtorsSql, params),
    db.exec(paymentBalanceSql, params),
  ]);

  let [debtors] = promises;
  const result = promises[1];

  const paymentsBalance = result[0];

  const debtorMap = {};
  debtors.forEach(debtor => {
    debtorMap[debtor.uuid] = debtor;
    debtor.invoices = [];
  });

  // mapping payments to the debtor
  paymentsBalance.forEach(pay => {
    if (pay.debtor_uuid) {
      try {
        debtorMap[pay.debtor_uuid].invoices.push(pay);
      } catch (e) {
        console.error('Could not find:', pay.debtor_uuid);
      }
    }
  });

  // remove all debtor without unbalanced invoices

  debtors = debtors.filter(debtor => {
    debtor.addSubTotal = debtor.invoices.length > 1;
    return debtor.invoices.length > 0;
  });

  // sums calculation
  let totalDebit = 0;
  let totalCredit = 0;
  let totalBalance = 0;
  debtors.forEach(debtor => {
    _.extend(debtor, { sumCredit : 0, sumDebit : 0, sumBalance : 0 });
    debtor.invoices.forEach(invoice => {
      debtor.sumCredit += invoice.credit;
      debtor.sumDebit += invoice.debit;
      debtor.sumBalance += invoice.balance;
    });

    debtor.sumCredit = util.roundDecimal(debtor.sumCredit, 4);
    debtor.sumDebit = util.roundDecimal(debtor.sumDebit, 4);
    debtor.sumBalance = util.roundDecimal(debtor.sumBalance, 4);

    totalCredit += debtor.sumCredit;
    totalDebit += debtor.sumDebit;
    totalBalance += debtor.sumBalance;
  });

  const paymentInterval = getPaymentPercentage(paymentsBalance);

  return {
    debtors, totalDebit, totalCredit, totalBalance, paymentInterval,
  };
}

function getPaymentPercentage(invoicesPayments) {
  let _0 = 0;
  let _0_25 = 0;
  let _25_50 = 0;
  let _50_75 = 0;
  let _75_100 = 0;
  let more = 0;

  invoicesPayments.forEach(pay => {
    const { paymentPercentage } = pay;
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
  });

  return {
    _0, _0_25, _25_50, _50_75, _75_100, more,
  };
}
