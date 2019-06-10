
/**
 * @overview
 * Journal Reports
 *
 * @description
 * This module contains all the code for rendering PDFs of Journal.
 */

const _ = require('lodash');
const multipayIndice = require('./index');
const ReportManager = require('../../../lib/ReportManager');

const REPORT_TEMPLATE = './server/controllers/payroll/multiplePayrollIndice/report.handlebars';

exports.document = multipayIndiceExport;

/**
 * GET reports/finance/journal
 *
 * @method postingJournalExport
 */
function multipayIndiceExport(req, res, next) {

  const options = _.extend(req.query, {
    filename                 : 'TREE.MULTI_PAYROLL_INDICE',
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

  return multipayIndice.lookUp(options).then(indices => {
    const { employees, rubrics } = indices;
    // display_name
    const headers = { display_name : '' };
    const rows = [];
    rubrics.forEach(r => {
      headers[r.abbr] = '';
    });
    rows.push(headers);
    rows.push(...setGridData(employees));

    return report.render({ rows });
  })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}

function setGridData(employees) {
  const data = [];
  employees.forEach(employee => {
    const row = {
      display_name : employee.display_name,
    };

    employee.rubrics.forEach(r => {
      row[r.rubric_abbr] = r.rubric_value;
    });
    data.push(row);
  });
  return data;
}
