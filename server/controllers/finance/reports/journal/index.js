
/**
 * @overview
 * Journal Reports
 *
 * @description
 * This module contains all the code for rendering PDFs of Journal
 */

const _    = require('lodash');
const ReportManager  = require('../../../../lib/ReportManager');
const NotFound = require('../../../../lib/errors/NotFound');
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
  let data;

  try  {
    report = new ReportManager(REPORT_TEMPLATE, req.session, options);
  } catch(e) {
    return next(e);
  }

  Journal.journalEntryList(options)
    .then(rows => {
      data = { rows: rows };
      return report.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}
