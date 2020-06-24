const q = require('q');
const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');

const TEMPLATE = './server/controllers/finance/reports/break_even/report.handlebars';
const TEMPLATE1 = './server/controllers/finance/reports/break_even/report_project.handlebars';
const AccountReference = require('../../accounts').references;
const setting = require('./setting');
const projectSetting = require('./break_even_project');
const getDistributionKey = require('../../distributionFeeCenter/getDistributionKey');

// expose to the API
exports.report = report;

// default report parameters
const DEFAULT_PARAMS = {
  csvKey : 'dataConfigured',
  filename : 'TREE.BREAK_EVEN_REPORT',
  orientation : 'portrait',
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
  const breakEvenProject = parseInt(params.breakEvenProject, 10);

  data.period = {
    start_date : params.start_date,
    end_date : params.end_date,
    fiscalYearStart : params.fiscalYearStart,
  };

  const templateFile = breakEvenProject ? TEMPLATE1 : TEMPLATE;

  _.defaults(params, DEFAULT_PARAMS);

  try {
    reporting = new ReportManager(templateFile, req.session, params);
  } catch (e) {
    next(e);
    return;
  }

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

  if (breakEvenProject) {
    const getProject = `
      SELECT p.id, p.name AS project_name
      FROM project AS p
    `;

    const getFeeCenter = `
      SELECT fc.id, fc.label, fc.is_principal, fc.project_id, p.name AS project_name
      FROM fee_center AS fc
      LEFT JOIN project AS p ON p.id = fc.project_id
      ORDER BY fc.label ASC, fc.is_principal DESC
    `;

    const getFeeCenterReference = `
      SELECT fc.label, fc.id, fc.is_principal, rf.fee_center_id, rf.account_reference_id,
      rf.is_cost, rf.is_variable, rf.is_turnover, ar.abbr
      FROM fee_center AS fc
      JOIN reference_fee_center AS rf ON rf.fee_center_id = fc.id
      JOIN account_reference AS ar ON ar.id = rf.account_reference_id
      ORDER BY fc.label
    `;

    const getFeeCenterDistribution = `
      SELECT fcd.principal_fee_center_id, fcd.auxiliary_fee_center_id, fcd.is_cost,
      fcd.is_variable, fcd.is_turnover, BUID(fcd.row_uuid) AS row_uuid,
      fca.label AS auxiliary, fcp.label AS principal, SUM(fcd.debit_equiv) AS debit,
      SUM(fcd.credit_equiv) AS credit, gl.trans_date
      FROM fee_center_distribution AS fcd
      JOIN general_ledger AS gl ON gl.uuid = fcd.row_uuid
      JOIN fee_center AS fcp ON fcp.id = fcd.principal_fee_center_id
      JOIN fee_center AS fca ON fca.id = fcd.auxiliary_fee_center_id
      WHERE DATE(gl.trans_date) >= DATE(?) AND DATE(gl.trans_date) <= DATE(?)
      GROUP BY fcd.principal_fee_center_id, fcd.auxiliary_fee_center_id;
    `;

    // Get Break Even By Project
    if (params.type) {
      getEncounters = `
        SELECT sfc.fee_center_id, f.label AS feeCenter, count(pv.uuid) AS numberOfCases, p.id AS project_id,
        p.name AS project_name
        FROM patient_visit AS pv
        JOIN patient_visit_service AS pvs ON pvs.patient_visit_uuid = pv.uuid
        JOIN service_fee_center AS sfc ON sfc.service_uuid = pvs.service_uuid
        JOIN fee_center AS f ON f.id = sfc.fee_center_id
        JOIN project AS p ON p.id = f.project_id
        WHERE DATE(pv.start_date) >= DATE(?) AND DATE(pv.start_date) <= DATE(?)
        GROUP BY f.project_id;
      `;
    } else {
      getEncounters = `
        SELECT sfc.fee_center_id, f.label AS feeCenter, pr.name AS project_name, pr.id AS project_id,
        SUM(hi.total_hospitalized_patient + hi.total_external_patient) AS numberOfCases, s.name
        FROM indicator AS i
        JOIN hospitalization_indicator AS hi ON hi.indicator_uuid = i.uuid
        JOIN period AS p ON p.id = i.period_id
        JOIN service_fee_center AS sfc ON sfc.service_uuid = i.service_uuid
        JOIN service AS s ON s.uuid = sfc.service_uuid
        JOIN fee_center AS f ON f.id = sfc.fee_center_id
        JOIN project AS pr ON pr.id = f.project_id
        WHERE DATE(p.start_date) >= DATE(?) AND DATE(p.end_date) <= DATE(?)
        GROUP BY pr.id`;
    }

    dbPromises = [
      db.exec(getFeeCenter),
      db.exec(getProject),
      db.exec(getFeeCenterReference),
      AccountReference.computeAllAccountReference(params.period_id),
      db.exec(getFeeCenterDistribution, [params.fiscalYearStart, params.end_date]),
      db.exec(getEncounters, [params.fiscalYearStart, params.end_date]),
      getDistributionKey.allDistributionKey(),
    ];
  } else {

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

  if (breakEvenProject) {
    q.all(dbPromises)
      .spread((feeCenter, projects, references, accountReferences, dataDistributions, encounters, distributionKey) => {
        const config = {
          feeCenter,
          references,
          accountReferences,
          dataDistributions,
          distributionKey,
          includeManual : params.includeManual,
        };
        const dataConfigured = projectSetting.configuration(config);
        // Getting Data for Project
        projects.forEach(project => {
          project.balanceVariableCost = 0;
          project.balanceFixedCost = 0;
          project.balanceTurnover = 0;
          project.balanceOtherRevenue = 0;

          dataConfigured.principal.forEach(princ => {
            if (project.id === princ.project_id) {
              project.balanceVariableCost += princ.balanceVariableCost;
              project.balanceFixedCost += princ.balanceFixedCost;
              project.balanceTurnover += princ.balanceTurnover;
              project.balanceOtherRevenue += princ.balanceOtherRevenue;
            }
          });

          encounters.forEach(encounter => {
            if (project.id === encounter.project_id) {
              project.numberOfCases = encounter.numberOfCases;
            }
          });
        });

        // Getting Data for Project
        projects.forEach(project => {
          project.data = projectSetting.breakEvenCalcul(project);
        });

        _.merge(data, { projects });
        return reporting.render(data);
      })
      .then(result => {
        res.set(result.headers).send(result.report);
      })
      .catch(next)
      .done();
  } else {
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
}
