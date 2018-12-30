const _ = require('lodash');
const ReportManager = require('../../../../lib/ReportManager');
const db = require('../../../../lib/db');

// path to the template to render
const TEMPLATE = './server/controllers/finance/reports/unpaid-invoice-payments/report.handlebars';

const DEFAULT_OPTIONS = {
  footerRight : '[page] / [toPage]',
  footerFontSize : '7',
  filename : 'REPORT.UNPAID_INVOICE_PAYMENTS_REPORT',
};

exports.document = build;

async function build(req, res, next) {
  const qs = _.extend(req.query, DEFAULT_OPTIONS);

  const metadata = _.clone(req.session);

  try {
    const report = new ReportManager(TEMPLATE, metadata, qs);

    const { dateFrom, dateTo } = qs;

    const { dataset, totals, services } = await getUnbalancedInvoices(qs);

    const data = _.extend({}, {
      dateFrom, dateTo, dataset, totals, services,
    });

    const compiled = await report.render(data);
    res.set(compiled.headers).send(compiled.report);
  } catch (e) {
    next(e);
  }
}

// invoice payements balance
async function getUnbalancedInvoices(options) {
  const params = [
    new Date(options.dateFrom),
    new Date(options.dateTo),
  ];

  const rows = await db.transaction()
    .addQuery('CALL UnbalancedInvoicePaymentsTable(?, ?);', params)
    .addQuery(`CALL Pivot(
        "unbalanced_invoices",
        "projectName,debtorGroupName,debtorReference",
        "serviceName",
        "balance",
        "",
        ""
      );
    `)
    .execute();

  const records = rows[rows.length - 1];
  const dataset = records[records.length - 2];

  // get a list of the keys in the dataset
  const keys = _.keys(_.clone(dataset[0]));

  // the omit the firs three columns and the last (totals) to get the services
  const services = _.dropRight(_.drop(keys, 3), 1);

  // the last line is the total row
  const totals = dataset.pop();

  // add properties for drawing a pretty grid.
  dataset.forEach(row => {
    if (!row.debtorReference) {
      row.isTotalRow = true;
    }
    if (!row.debtorGroupName) {
      row.isGroupTotalRow = true;
    }
  });

  return { dataset, services, totals };
}
