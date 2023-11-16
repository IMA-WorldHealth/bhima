/**
 * @overview
 * Account Statement Reports
 *
 * @description
 * This module contains all the code for rendering PDFs of account statement
 */

const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');
const generalLedger = require('../../generalLedger');
const shared = require('../shared');

const REPORT_TEMPLATE = './server/controllers/finance/reports/account_statement/report.handlebars';

exports.report = report;

/**
 * GET reports/finance/account_statement
 *
 * @method report
 */
async function report(req, res, next) {
  const options = _.extend(req.query, {
    filename : 'TREE.ACCOUNT_STATEMENT',
    orientation : 'landscape',
    csvKey : 'rows',
    suppressDefaultFiltering : true,
    suppressDefaultFormatting : false,
  });

  const filters = shared.formatFilters(options);

  try {
    const rm = new ReportManager(REPORT_TEMPLATE, req.session, options);
    const rows = await generalLedger.findTransactions(options);

    const aggregateSql = `
      SELECT SUM(debit_equiv) AS debit_equiv, SUM(credit_equiv) AS credit_equiv
      FROM general_ledger
      WHERE uuid = ?;
    `;

    const [transactionUuids] = rows.map(row => db.bid(row.uuid));
    const aggregateData = await db.one(aggregateSql, [transactionUuids]);
    let aggregate;
    if (aggregateData) {
      aggregate = { ...aggregateData };
      aggregate.balance = aggregateData.debit_equiv - aggregateData.credit_equiv;
    } else {
      aggregate.debit_equiv = 0;
      aggregate.credit_equiv = 0;
      aggregate.balance = 0;
    }
    const result = await rm.render({ rows, aggregate, filters });
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }

}
