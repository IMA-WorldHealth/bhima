
/**
 * @overview General Ledger Accounts Reports
 *
 * @description
 * This module contains all the code for rendering PDFs of Journal
 */

const _ = require('lodash');
const ReportManager = require('../../../../lib/ReportManager');
const GeneralLedger = require('../../generalLedger');

const REPORT_TEMPLATE = './server/controllers/finance/reports/generalLedger/report.handlebars';

exports.report = renderReport;


/**
 * GET reports/finance/general_ledger
 *
 * @method report
 */
function renderReport(req, res, next) {
  const options = _.extend(req.query, { filename: 'TREE.GENERAL_LEDGER', csvKey: 'rows' });
  let report;
  let data;

  try {
    report = new ReportManager(REPORT_TEMPLATE, req.session, options);
  } catch (e) {
    return next(e);
  }

  return GeneralLedger.getlistAccounts()
    .then((rows) => {
      data = { rows };
      return report.render(data);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}
