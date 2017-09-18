/**
 * @overview
 * Journal Reports
 *
 * @description
 * This module contains all the code for rendering PDFs of Journal.
 */

const _ = require('lodash');
const ReportManager = require('../../../../lib/ReportManager');
const db = require('../../../../lib/db');
const Journal = require('../../journal');

const REPORT_TEMPLATE = './server/controllers/finance/reports/journal/report.handlebars';

exports.postingReport = postingJournalExport;

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
    footerRight : '[page] / [toPage]',
    footerFontSize : '7',
  });

  let report;

  try {
    report = new ReportManager(REPORT_TEMPLATE, req.session, options);
  } catch (e) {
    return next(e);
  }

  const unposted = Journal.buildTransactionQuery(options, false);
  const posted = Journal.buildTransactionQuery(options, true);

  return db.exec(
    `(${posted.sql}) UNION ALL (${unposted.sql}) ORDER BY trans_date;`,
    [...posted.parameters, ...unposted.parameters]
  )
    .then(rows => {
      const totals = rows.reduce((aggregates, row) => {
        aggregates.debit += row.debit_equiv;
        aggregates.credit += row.credit_equiv;
        aggregates.balance += (row.debit_equiv - row.credit_equiv);
        return aggregates;
      }, { debit : 0, credit : 0, balance : 0 });

      return report.render({ rows, totals });
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}
