/**
 * @overview
 * Account Statement Reports
 *
 * @description
 * This module contains all the code for rendering PDFs of account statement
 */

const _ = require('lodash');
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

  try {
    rm = new ReportManager(REPORT_TEMPLATE, req.session, options);
  } catch (e) {
    return next(e);
  }

  return Journal.journalEntryList(options, 'general_ledger')
    .then(rows => rm.render({ rows, isPosted : true }))
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}
