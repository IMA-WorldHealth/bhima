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
const Journal = require('../../journal');

const REPORT_TEMPLATE = './server/controllers/finance/reports/account_statement/report.handlebars';

exports.report = report;

/**
 * GET reports/finance/account_statement
 *
 * @method report
 */
function report(req, res, next) {
  const options = _.extend(req.query, {
    filename                 : 'TREE.ACCOUNT_STATEMENT',
    orientation              : 'landscape',
    csvKey                   : 'rows',
    suppressDefaultFiltering : true,
    suppressDefaultFormating : false,
  });

  let rm;
  const glb = {};

  try {
    rm = new ReportManager(REPORT_TEMPLATE, req.session, options);
  } catch (e) {
    return next(e);
  }

  return Journal.journalEntryList(options, 'general_ledger')
    .then((rows) => {
      glb.rows = rows;

      const aggregateSql = `
        SELECT SUM(debit_equiv) AS debit_equiv, SUM(credit_equiv) AS credit_equiv, 
          SUM(debit_equiv - credit_equiv) AS balance 
        FROM general_ledger 
        WHERE uuid IN (?);
      `;
      const transactionIds = rows.map(row => {
        return db.bid(row.uuid);
      });
      return db.one(aggregateSql, [transactionIds]);
    })
    .then((result) => {
      glb.aggregate = result;
      return rm.render({ rows : glb.rows, aggregate : glb.aggregate });
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}
