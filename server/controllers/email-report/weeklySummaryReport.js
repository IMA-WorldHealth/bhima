/**
 * @module email-report/email-report
 *
 * @description
 * small description of this module
 *
 * @requires db
 * @requires node-uuid
 * @requires BadRequest
 * @requires NotFound
 */


const uuid = require('node-uuid');

const db = require('../../lib/db');
const Topic = require('../../lib/topic');

const BadRequest = require('../../lib/errors/BadRequest');
const NotFound = require('../../lib/errors/NotFound');
const Period = require('../../lib/period');

const ReportManager = require('../../lib/ReportManager');
const _ = require('lodash');

const TEMPLATE = './server/controllers/email-report/weeklySummaryReport.handlebars';

exports.view1 = view1;
exports.weeklySummaryReport = weeklySummaryReport;
let documentReport;


//income by service

function loadServicesIncome() {

  var sql = `
    SELECT
      SUM(invoice.cost) as sumCost,
      service.name as serviceName,
      CONCAT_WS('.', 'IV', project.abbr, invoice.reference) AS reference,
      invoice.reversed

    FROM invoice
      JOIN debtor AS d ON invoice.debtor_uuid = d.uuid
      JOIN service ON service.id = invoice.service_id
      JOIN project ON project.id = invoice.project_id

    WHERE DATE(invoice.date) >= DATE(?) AND
      DATE(invoice.date) <= DATE(?)

    GROUP BY service.id
  `;


  var period = new Period(new Date());
  var week = period.periods.week.limit;

  var monday =  week.start();
  var sunday =  week.end();

  var values = [monday, sunday];

  return db.exec(sql, values);

}


/*
  This function returns the number of registered patients
  for the current week and for the lasrt one
*/
function getRegisteredPatientsNumber() {

  var period = new Period(new Date());

  var week = period.periods.week.limit;

  var monday = week.start();
  var sunday = week.end();

  var Lastweek = period.periods.lastWeek.limit;

  var lastmonday = Lastweek.start();
  var lastsunday = Lastweek.end();

  //patients registered this week
  var sql = `SELECT
              subquery1.NumberOfpatientsThisWeek, subquery2.NumberOfpatientsLastWeek
            FROM
              (
                SELECT count(uuid) as NumberOfpatientsThisWeek
                FROM patient
                WHERE (registration_date BETWEEN ? AND ? )
              ) as subquery1,
              (
                SELECT count(uuid) as NumberOfpatientsLastWeek
                FROM patient
                WHERE (registration_date BETWEEN ? AND ? )
              ) as subquery2`;

  var values = [monday, sunday, lastmonday, lastsunday];

  var thisWeekPatients = [];

  return db.exec(sql, values);

}

//first and last invoice per day for a week
function MaxMinInvoiceDate() {

  var sql = `
    SELECT  MIN(i.date) as minDate, MAX(i.date) as maxDate
    From invoice i
    WHERE DATE(i.date) BETWEEN ? AND ?
    GROUP BY DATE(i.date)
  `;

  var period = new Period(new Date());
  var week = period.periods.week.limit;

  var monday = week.start();
  var sunday = week.end();

  return db.exec(sql, [monday, sunday]);
}

//test to see how to the report looks like
function view1(req, res, next) {

  const options = {
    renderer: 'pdf',
    saveReport: false,
    filename: 'test_summary_report',
    orientation: 'portrait',
  };

  //patient registered
  getRegisteredPatientsNumber().then(_patientsData => {

    //services incomes
    loadServicesIncome().then(_servicesIncome => {

      //max and min date of invoice each day for a week
      MaxMinInvoiceDate().then(_MaxMinInvoiceDate => {

        //rendering the report
        var report = new ReportManager(TEMPLATE, req.session, options);

        if (_patientsData.lenght === 0) {
          _patientsData = { "NumberOfpatientsThisWeek": 0, "NumberOfpatientsLastWeek": 0 };
        } else {
          _patientsData = _patientsData[0];
        }

        var data = {
          patientsData: _patientsData,
          servicesIncome: _servicesIncome,
          MaxMinInvoiceDate: _MaxMinInvoiceDate
        }

        report.render(data).then((result) => {
          res.set(result.headers).send(result.report);
        });

      });
    });

  })
  .catch(next)
  .done();


}


//one of the reports that bhima send by email
function weeklySummaryReport(currentSession) {

  const options = {
    renderer: 'pdf',
    saveReport: false,
    filename: 'test_summary_report.pdf',
    orientation: 'portrait',
  };

  //patient registered
  return getRegisteredPatientsNumber().then( (_patientsData) => {

    //services incomes
    return loadServicesIncome().then((_servicesIncome) => {

      //max and min date of invoice each day for a week
      return MaxMinInvoiceDate().then(_MaxMinInvoiceDate => {
        //rendering the report
        var report = new ReportManager(TEMPLATE, currentSession, options);

        if (_patientsData.lenght === 0) {
          _patientsData = { "NumberOfpatientsThisWeek": 0, "NumberOfpatientsLastWeek": 0 };
        } else {
          _patientsData = _patientsData[0];
        }

        var data = {
          patientsData: _patientsData,
          servicesIncome: _servicesIncome,
          MaxMinInvoiceDate: _MaxMinInvoiceDate
        }
        //console.log(data);
        return report.render(data);

      });
    });
  });

}
