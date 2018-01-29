/**
 * @overview General Ledger Accounts Reports
 *
 * @description
 * This module contains all the code for rendering PDFs of the general ledgers.
 * It should really use the same code as the accounts reports.
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
  const options = _.extend(req.query, {
    filename : 'TREE.GENERAL_LEDGER',
    orientation : 'landscape',
    csvKey   : 'rows',
    footerRight : '[page] / [toPage]',
    footerFontSize : '7',
  });

  let report;
  let data;

  try {
    report = new ReportManager(REPORT_TEMPLATE, req.session, options);
  } catch (e) {
    return next(e);
  }

  const fiscalYearId = options.fiscal_year_id;
  const TITLE_ACCOUNT_ID = 6;

  return GeneralLedger.getAccountTotalsMatrix(fiscalYearId)
    .then((rows) => {
      rows.forEach(row => {
        row.isTitleAccount = row.type_id === TITLE_ACCOUNT_ID;
        row.padLeft = row.depth * 15;
      });
      data = { rows };
      data.fiscal_year_label = options.fiscal_year_label;
      return report.render(data);
    })
    .then((result) => {
      if (result.headers.type === 'xlsx') {
        res.xls(result.headers.filename, result.report.rows);
      } else {
        res.set(result.headers).send(result.report);
      }
    })
    .catch(next)
    .done();
}
