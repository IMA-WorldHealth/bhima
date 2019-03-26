const _ = require('lodash');
const ReportManager = require('../../../../lib/ReportManager');
const db = require('../../../../lib/db');
const util = require('../../../../lib/util');
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

  let report;
  let results;

  try {
    report = new ReportManager(TEMPLATE, metadata, qs);
    results = await getUnbalancedInvoices(qs);
  } catch (err) {

    // NOTE(@jniles) we throw for all errors except the 3COLLATIONS error and
    // parse error.  These errors mean that we didn't pick up enough data in
    // our query, so it is empty.  We'll show the client an empty table instead.
    if (err.code !== 'ER_CANT_AGGREGATE_3COLLATIONS' && err.code !== 'ER_PARSE_ERROR') {
      next(err);
      return;
    }

    // provide empty data for the report to render
    results = { dataset : [], totals : {}, services : [] };
  }

  const data = _.extend({}, qs, results);

  const compiled = await report.render(data);
  res.set(compiled.headers).send(compiled.report);
}

// invoice payements balance
async function getUnbalancedInvoices(options) {
  const params = [
    new Date(options.dateFrom),
    new Date(options.dateTo),
  ];

  const wherePart = options.debtorGroupName ? `WHERE debtorGroupName = ${db.escape(options.debtorGroupName)}` : '';

  const rows = await db.transaction()
    .addQuery('CALL UnbalancedInvoicePaymentsTable(?, ?);', params)
    .addQuery(`CALL Pivot(
        "unbalanced_invoices",
        "debtorGroupName,debtorUuid",
        "serviceName",
        "balance",
        "${wherePart}",
        ""
      );
    `)
    .execute();

  const records = rows[rows.length - 1];
  const dataset = records[records.length - 2];

  // get a list of the keys in the dataset
  const keys = _.keys(_.clone(dataset[0]));

  const debtorUuids = dataset
    .filter(row => row.debtorUuid)
    .map(row => db.bid(row.debtorUuid));

  // make human readable names for the users
  const debtorNames = await db.exec(`
    SELECT BUID(debtor.uuid) AS uuid, em.text as reference, debtor.text, p.dob
    FROM debtor JOIN entity_map em ON debtor.uuid = em.uuid
    LEFT JOIN patient p ON p.debtor_uuid = debtor.uuid
    WHERE debtor.uuid IN (?);
  `, [debtorUuids]);

  const debtorNameMap = _.keyBy(debtorNames, 'uuid');

  // the omit the first three columns and the last (totals) to get the services
  const services = _.dropRight(_.drop(keys, 2), 1);

  // the last line is the total row
  const totals = dataset.pop();

  // add properties for drawing a pretty grid.
  dataset.forEach(row => {
    if (!row.debtorUuid) {
      row.isTotalRow = true;
    }

    if (!row.debtorGroupName) {
      row.isGroupTotalRow = true;
    }

    // add pretty debtor names
    const debtor = debtorNameMap[row.debtorUuid];
    if (debtor) {
      row.debtorReference = debtor.reference;
      row.debtorText = debtor.text;
      row.debtorAge = util.calcualteAge(debtor.dob);
    }
  });

  return { dataset, services, totals };
}
