
/**
 * @overview
 * Journal Reports
 *
 * @description
 * This module contains all the code for rendering PDFs of Journal.
 */

const _ = require('lodash');
const staffing = require('./index');
const shared = require('../../../controllers/finance/reports/shared.js');
const ReportManager = require('../../../lib/ReportManager');

const REPORT_TEMPLATE = './server/controllers/payroll/staffingIndices/report.handlebars';

exports.document = staffingIndicesExport;

/**
 * GET reports/finance/journal
 *
 * @method postingJournalExport
 */
function staffingIndicesExport(req, res, next) {

  const options = _.extend(req.query, {
    filename                 : 'TREE.STAFFING_INDICES_MANAGEMENT',
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
  const filters = shared.formatFilters(options);

  return staffing.lookUp(options).then(indices => {
    return report.render({ filters, indices });
  })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}
