const q = require('q');
const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');

const TEMPLATE = './server/controllers/finance/reports/break_even/report.handlebars';
const AccountReference = require('../../accounts').references;
const setting = require('./setting');

// expose to the API
exports.report = report;

// default report parameters
const DEFAULT_PARAMS = {
  csvKey : 'brea_report',
  filename : 'TREE.BREAK_EVEN_REPORT',
  orientation : 'portrait',
  footerRight : '[page] / [toPage]',
};

/**
 * @function report
 *
 * @description
 * This function renders the balance of accounts references as report.  The account_reference report provides a view
 * of the balance of account_references for a given period of fiscal year.
 */
function report(req, res, next) {
  const params = req.query;
  const data = {};
  // Account Reference Type for Break Even
  const BREAK_EVEN_ACCOUNT_REFERENCE_TYPE = 4;

  let reporting;
  let getEncounters;
  let dbPromises;

  params.start_date = new Date(params.start_date);
  params.end_date = new Date(params.end_date);
  params.type = parseInt(params.type, 10);

  data.period = {
    start_date : params.start_date,
    end_date : params.end_date,
    fiscalYearStart : params.fiscalYearStart,
  };

  _.defaults(params, DEFAULT_PARAMS);

  try {
    reporting = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    next(e);
    return;
  }

  if (params.breakEvenProject) {
    const getBreakEvenReference = `
      SELECT br.id, br.label, br.is_cost, br.is_variable, br.is_turnover, br.account_reference_id,
      ar.description AS desc_ref, ar.abbr, ari.account_id, GROUP_CONCAT(a.number SEPARATOR ', ') AS accounts_numbers
      FROM break_even_reference AS br
      JOIN account_reference AS ar ON ar.id = br.account_reference_id
      JOIN account_reference_item AS ari ON ari.account_reference_id = ar.id
      JOIN account AS a ON a.id = ari.account_id
      GROUP BY br.id
      ORDER BY br.is_cost DESC, br.label ASC ;
    `;

    if (params.type) {
      getEncounters = `
        SELECT sfc.fee_center_id, f.label AS feeCenter, count(pv.uuid) AS numberOfCases, p.id, p.name
        FROM patient_visit AS pv
        JOIN patient_visit_service AS pvs ON pvs.patient_visit_uuid = pv.uuid
        JOIN service_fee_center AS sfc ON sfc.service_id = pvs.service_id
        JOIN fee_center AS f ON f.id = sfc.fee_center_id
        JOIN project AS p ON p.id = f.project_id
        WHERE DATE(pv.start_date) >= DATE(?) AND DATE(pv.start_date) <= DATE(?)
        GROUP BY f.project_id;
      `;
    } else {

      // SELECT sfc.fee_center_id, f.label AS feeCenter, count(pv.uuid) AS numberOfCases, p.id, p.name
      // FROM patient_visit AS pv
      // JOIN patient_visit_service AS pvs ON pvs.patient_visit_uuid = pv.uuid
      // JOIN service_fee_center AS sfc ON sfc.service_id = pvs.service_id
      // JOIN fee_center AS f ON f.id = sfc.fee_center_id
      // JOIN project AS p ON p.id = f.project_id
      // WHERE DATE(pv.start_date) >= DATE('2018-01-01') AND DATE(pv.start_date) <= DATE('2018-12-31');

    //   SELECT sfc.fee_center_id, s.name, COUNT(s.id) AS numberCases, f.label AS feeCenter, p.id, p.name
    //   FROM patient_visit AS pv
    //   JOIN patient_visit_service AS pvs ON pvs.patient_visit_uuid = pv.uuid
    //   JOIN service_fee_center AS sfc ON sfc.service_id = pvs.service_id
    //   JOIN fee_center AS f ON f.id = sfc.fee_center_id
    //   JOIN project AS p ON p.id = f.project_id
    //   JOIN service AS s ON s.id = sfc.service_id
    //   WHERE DATE(pv.start_date) >= DATE('2018-01-01') AND DATE(pv.start_date) <= DATE('2018-12-31')
		// GROUP BY sfc.service_id;
      

      getEncounters = `
        SELECT SUM(hi.total_hospitalized_patient + hi.total_external_patient) AS numberCase
        FROM indicator AS i
        JOIN hospitalization_indicator AS hi ON hi.indicator_uuid = i.uuid
        JOIN period AS p ON p.id = i.period_id
        WHERE DATE(p.start_date) >= DATE(?) AND DATE(p.end_date) <= DATE(?)`;
    }

    dbPromises = [
      db.exec(getBreakEvenReference),
      db.exec(getEncounters, [params.fiscalYearStart, params.end_date]),
      AccountReference.computeAllAccountReference(params.period_id, BREAK_EVEN_ACCOUNT_REFERENCE_TYPE),
    ];
  } else {
    const getBreakEvenReference = `
      SELECT br.id, br.label, br.is_cost, br.is_variable, br.is_turnover, br.account_reference_id,
      ar.description AS desc_ref, ar.abbr, ari.account_id, GROUP_CONCAT(a.number SEPARATOR ', ') AS accounts_numbers
      FROM break_even_reference AS br
      JOIN account_reference AS ar ON ar.id = br.account_reference_id
      JOIN account_reference_item AS ari ON ari.account_reference_id = ar.id
      JOIN account AS a ON a.id = ari.account_id
      GROUP BY br.id
      ORDER BY br.is_cost DESC, br.label ASC ;
    `;

    if (params.type) {
      getEncounters = `
        SELECT count(pv.uuid) AS numberCase
        FROM patient_visit AS pv
        WHERE DATE(pv.start_date) >= DATE(?) AND DATE(pv.start_date) <= DATE(?)
      `;
    } else {
      getEncounters = `
        SELECT SUM(hi.total_hospitalized_patient + hi.total_external_patient) AS numberCase
        FROM indicator AS i
        JOIN hospitalization_indicator AS hi ON hi.indicator_uuid = i.uuid
        JOIN period AS p ON p.id = i.period_id
        WHERE DATE(p.start_date) >= DATE(?) AND DATE(p.end_date) <= DATE(?)`;
    }

    dbPromises = [
      db.exec(getBreakEvenReference),
      db.exec(getEncounters, [params.fiscalYearStart, params.end_date]),
      AccountReference.computeAllAccountReference(params.period_id, BREAK_EVEN_ACCOUNT_REFERENCE_TYPE),
    ];
  }

  q.all(dbPromises)
    .spread((breakEvenReference, encounters, accountReferences) => {
      const config = {
        breakEvenReference,
        encounters,
        accountReferences,
      };
      const dataConfigured = setting.configuration(config);

      _.merge(data, dataConfigured);
      return reporting.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}
