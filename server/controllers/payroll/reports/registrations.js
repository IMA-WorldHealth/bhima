
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

const Employees = require('../employees');

const TEMPLATE = './server/controllers/payroll/reports/registrations.handlebars';

// translation key mappings for dynamic filters
// Basically, to show a pretty filter bar, this will translate URL query params
// into human-readable text to be placed in the report, showing the properties
// filtered on.
function formatFilters(qs) {
  const columns = [
    { field: 'display_name', displayName: 'FORM.LABELS.NAME' },
    { field: 'sexe', displayName: 'FORM.LABELS.GENDER' },
    { field: 'code', displayName: 'FORM.LABELS.CODE' },
    { field: 'dateBirthFrom', displayName: 'FORM.LABELS.DOB', comparitor: '>', isDate : true },
    { field: 'dateBirthTo', displayName: 'FORM.LABELS.DOB', comparitor: '<', isDate : true },
    { field: 'dateEmbaucheFrom', displayName: 'FORM.LABELS.DATE_EMBAUCHE', comparitor: '>', isDate : true },
    { field: 'dateEmbaucheTo', displayName: 'FORM.LABELS.DATE_EMBAUCHE', comparitor: '<', isDate : true },
    { field: 'grade_id', displayName: 'FORM.LABELS.GRADE' },
    { field: 'fonction_id', displayName: 'FORM.LABELS.FUNCTION' },
    { field: 'service_id', displayName: 'FORM.LABELS.SERVICE' },
  ];

  return columns.filter(column => {
    const value = qs[column.field];

    if (!_.isUndefined(value)) {
      column.value = value;
      return true;
    }
    return false;
  });
}

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
  const options = _.extend(req.query, { csvKey : 'employees' });
  let report;

  // for now ReportManager will translate any key provided for filename as well as add a uniform timestamp
  options.filename = 'EMPLOYEE.TITLE';

  // set up the report with report manager
  try {
    options.orientation = 'landscape';
    report = new ReportManager(TEMPLATE, req.session, options);
    delete options.orientation;
  } catch (e) {
    next(e);
    return;
  }

  const filters = formatFilters(options);

  // enforce detailed columns
  options.detailed = 1;

  const sql = 
  `SELECT 
	    COUNT(employee.id) AS numEmployees, SUM(sexe = 'F') AS numFemales, 
        ROUND(SUM(sexe = 'F') / COUNT(employee.id) * 100) AS percentFemales,
        SUM(sexe = 'M') AS numMales, ROUND(SUM(sexe = 'M') / COUNT(employee.id) * 100) AS percentMales
    FROM 
        employee
    WHERE 
        employee.id IN (?);
  `;

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

      // gather the uuids for the aggregate queries
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
