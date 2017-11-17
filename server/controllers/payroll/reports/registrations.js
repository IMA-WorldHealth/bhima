
/**
 * @overview reports/registrations
 *
 * @description
 * This file contains code to create a PDF report of all employee registrations,
 * matching query conditions passed from the employee registry UI grid.
 *
 * @requires lodash
 * @requires moment
 * @requires Employees
 * @requires ReportManager
 */

const _ = require('lodash');
const moment = require('moment');

const ReportManager = require('../../../lib/ReportManager');
const db = require('../../../lib/db');
const shared = require('../../finance/reports/shared');

const Employees = require('../employees');

const TEMPLATE = './server/controllers/payroll/reports/registrations.handlebars';

/**
 * @method build
 *
 * @description
 * This method builds the report of employee registrations to be shipped back to
 * the client.  This method will eventually use the Employees.search() method to
 * specify query conditions.
 *
 * GET /reports/payroll/employees
 */
function build(req, res, next) {
  const options = _.clone(req.query);

  _.extend(options, { 
    filename : 'EMPLOYEE.TITLE', 
    csvKey : 'employees', 
    orientation : 'landscape',
    footerRight : '[page] / [toPage]',
    footerFontSize : '7',
  });

  let report;

  // set up the report with report manager
  try {
    report = new ReportManager(TEMPLATE, req.session, options);
    delete options.orientation;
  } catch (e) {
    next(e);
    return;
  }

  const filters = shared.formatFilters(options);

  // enforce detailed columns
  options.detailed = 1;

  const sql =
  `SELECT
    COUNT(employee.id) AS numEmployees, SUM(sex = 'F') AS numFemales,
    ROUND(SUM(sex = 'F') / COUNT(employee.id) * 100) AS percentFemales,
    SUM(sex = 'M') AS numMales, ROUND(SUM(sex = 'M') / COUNT(employee.id) * 100) AS percentMales
  FROM
    employee
  WHERE
    employee.id IN (?);`;

  const data = { filters };

  Employees.find(options)
    .then(employees => {
      // calculate ages with moment
      employees.forEach(employee => {
        employee.age = moment().diff(employee.dob, 'years');
      });

      data.employees = employees;

      // if no employees matched the previous query, set the promise value to false
      // and skip rendering aggregates in the handlbars view
      if (!employees) { return false; }

      // gather the ids for the aggregate queries
      const ids = employees.map(p => p.id);

      return db.one(sql, [ids]);
    })
    .then(aggregates => {
      data.aggregates = aggregates;
      return report.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

module.exports = build;
