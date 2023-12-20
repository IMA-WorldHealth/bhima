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
 * GET reports/finance/multiplepayrollIndice
 *
 * @method multipayIndiceExport
 */
function multipayIndiceExport(req, res, next) {

  const options = _.extend(req.query, {
    filename                 : 'TREE.MULTI_PAYROLL_INDICE',
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

  return multipayIndice.lookUp(options).then(indices => {
    const { employees, rubrics } = indices;
    const rows = getEmployeeRubricMatrix(employees, rubrics);
    return report.render({ rows });
  })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}

/**
 * @function getEmployeeRubricMatrix
 *
 * @description
 * This function takes a list of employees and their assigned rubrics and returns
 * a matrix of the employees by rubrics for display in a grid.
 */
function getEmployeeRubricMatrix(employees, rubrics) {
  const headers = { display_name : '', service : '' };

  rubrics.forEach(r => { headers[r.abbr] = ''; });

  // return a matrix of employees by rubrics
  return employees.map(employee => {
    const row = {
      display_name : employee.display_name,
      service : employee.service_name,
    };

    // map each rubric into columns
    employee.rubrics.forEach(r => {
      row[r.rubric_abbr] = r.rubric_value;
    });

    return row;
  });
}
