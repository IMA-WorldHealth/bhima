/**
 * @overview
 * Journal Reports
 *
 * @description
 * This module contains all the code for rendering PDFs of Journal
 */

const _ = require('lodash');
const ReportManager = require('../../../../lib/ReportManager');
const Journal = require('../../journal');

const REPORT_TEMPLATE = './server/controllers/finance/reports/journal/report.handlebars';

exports.postingReport = postingJournalExport;
exports.postedReport = postedJournalExport;

/**
 * GET reports/finance/journal
 *
 * @method postingJournalExport
 */
function postingJournalExport(req, res, next) {
  const options = _.extend(req.query, {
    filename                 : 'POSTING_JOURNAL.TITLE',
    orientation              : 'landscape',
    csvKey                   : 'rows',
    suppressDefaultFiltering : true,
    suppressDefaultFormating : false,
  });

  let report;

  try {
    report = new ReportManager(REPORT_TEMPLATE, req.session, options);
  } catch (e) {
    return next(e);
  }

  return Journal.journalEntryList(options)
    .then(rows => report.render({ rows }))
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

/**
 * GET reports/finance/posted_journal
 *
 * @method postedJournalExport
 */
function postedJournalExport(req, res, next) {
  const options = _.extend(req.query, {
    filename                 : 'TREE.POSTED_JOURNAL',
    orientation              : 'landscape',
    csvKey                   : 'rows',
    suppressDefaultFiltering : true,
    suppressDefaultFormating : false,
  });

  let report;

  try {
    report = new ReportManager(REPORT_TEMPLATE, req.session, options);
  } catch (e) {
    return next(e);
  }

  return Journal.journalEntryList(options, 'general_ledger')
    .then(rows => report.render({ rows, isPosted : true }))
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}
