/**
 * @overview
 * Journal Reports
 *
 * @description
 * This module contains all the code for rendering PDFs of Journal
 */

const ReportManager = require('../../../../lib/ReportManager');
const Journal = require('../../journal');

const REPORT_TEMPLATE = './server/controllers/finance/reports/journal/report.handlebars';

exports.report = report;

/**
 * GET reports/finance/journal
 *
 * @method report
 */
function report(req, res, next) {
  const options = req.query;
  let report;

  try {
    report = new ReportManager(REPORT_TEMPLATE, req.session, options);
  } catch (e) {
    return next(e);
  }

  Journal.journalEntryList(options)
    .then(rows => report.render({ rows }))
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}
