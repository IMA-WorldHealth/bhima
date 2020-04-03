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
const shared = require('../shared');

const REPORT_TEMPLATE = './server/controllers/finance/reports/journal/report.handlebars';

exports.postingReport = postingJournalExport;

/**
 * GET reports/finance/journal
 *
 * @method postingJournalExport
 */
async function postingJournalExport(req, res, next) {
  /*
   theses below properties are used for rename the result keys
  some time export report with the database columns' labels
  which is not understandable for the end user
  */
  const options = _.extend(req.query, {
    filename : 'POSTING_JOURNAL.TITLE',
    orientation : 'landscape',
    csvKey : 'rows',
    suppressDefaultFiltering : true,
    suppressDefaultFormatting : false,
  });

  const filters = shared.formatFilters(options);

  try {
    const report = new ReportManager(REPORT_TEMPLATE, req.session, options);
    const unposted = Journal.buildTransactionQuery(options, false);
    const posted = Journal.buildTransactionQuery(options, true);

    const rows = await db.exec(
      `(${posted.sql}) UNION ALL (${unposted.sql}) ORDER BY trans_date;`,
      [...posted.parameters, ...unposted.parameters],
    );

    const totals = rows.reduce((aggregates, row) => {
      aggregates.debit += row.debit_equiv;
      aggregates.credit += row.credit_equiv;
      aggregates.balance += (row.debit_equiv - row.credit_equiv);
      return aggregates;
    }, { debit : 0, credit : 0, balance : 0 });

    const result = await report.render({ rows, totals, filters });
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}
