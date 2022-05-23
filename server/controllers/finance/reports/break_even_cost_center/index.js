const q = require('q');
const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');

const TEMPLATE = './server/controllers/finance/reports/break_even_cost_center/report.handlebars';
const AccountReference = require('../../accounts').references;
const setting = require('./setting');
const getDistributionKey = require('../../allocationCostCenter/getDistributionKey');

// expose to the API
exports.report = report;

// default report parameters
const DEFAULT_PARAMS = {
  csvKey : 'brea_report',
  filename : 'TREE.BREAK_EVEN_COST_CENTER_REPORT',
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
  let getEncounterCostCenter;
  let costCentersChecked = [];

  if (params.costCenters) {
    costCentersChecked = params.costCenters.map(item => parseInt(item, 10));
  }

  const data = {};
  let reporting;

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

  const getCostCenter = `
    SELECT fc.id, fc.label, fc.is_principal FROM cost_center AS fc ORDER BY fc.label ASC, fc.is_principal DESC
  `;

  const getCostCenterReference = `
    SELECT fc.label, fc.id, fc.is_principal, rf.cost_center_id, rf.account_reference_id,
    rf.is_cost, rf.is_variable, rf.is_turnover, ar.abbr
    FROM cost_center AS fc
    JOIN reference_cost_center AS rf ON rf.cost_center_id = fc.id
    JOIN account_reference AS ar ON ar.id = rf.account_reference_id
    ORDER BY fc.label
  `;

  const getCostCenterDistribution = `
    SELECT fcd.principal_cost_center_id, fcd.auxiliary_cost_center_id, fcd.is_cost,
    fcd.is_variable, fcd.is_turnover, BUID(fcd.row_uuid) AS row_uuid,
    fca.label AS auxiliary, fcp.label AS principal, SUM(fcd.debit_equiv) AS debit,
    SUM(fcd.credit_equiv) AS credit, gl.trans_date
    FROM cost_center_allocation AS fcd
    JOIN general_ledger AS gl ON gl.uuid = fcd.row_uuid
    JOIN cost_center AS fcp ON fcp.id = fcd.principal_cost_center_id
    JOIN cost_center AS fca ON fca.id = fcd.auxiliary_cost_center_id
    WHERE DATE(gl.trans_date) >= DATE(?) AND DATE(gl.trans_date) <= DATE(?)
    GROUP BY fcd.principal_cost_center_id, fcd.auxiliary_cost_center_id;
  `;

  if (params.type) {
    getEncounterCostCenter = `
      SELECT sfc.cost_center_id, f.label AS costCenter, count(pv.uuid) AS numberOfCases
      FROM patient_visit AS pv
      JOIN patient_visit_service AS pvs ON pvs.patient_visit_uuid = pv.uuid
      JOIN service_cost_center AS sfc ON sfc.service_uuid = pvs.service_uuid
      JOIN cost_center AS f ON f.id = sfc.cost_center_id
      WHERE DATE(pv.start_date) >= DATE(?) AND DATE(pv.start_date) <= DATE(?)
      GROUP BY sfc.cost_center_id
    `;
  } else {
    getEncounterCostCenter = `
      SELECT sfc.cost_center_id, f.label AS costCenter,
      SUM(hi.total_hospitalized_patient + hi.total_external_patient) AS numberOfCases
      FROM indicator AS i
      JOIN hospitalization_indicator AS hi ON hi.indicator_uuid = i.uuid
      JOIN period AS p ON p.id = i.period_id
      JOIN service_cost_center AS sfc ON sfc.service_uuid = i.service_uuid
      JOIN cost_center AS f ON f.id = sfc.cost_center_id
      WHERE DATE(p.start_date) >= DATE(?) AND DATE(p.end_date) <= DATE(?)
      GROUP BY sfc.cost_center_id;
    `;
  }

  const dbPromises = [
    db.exec(getCostCenter),
    db.exec(getCostCenterReference),
    AccountReference.computeAllAccountReference(params.period_id),
    db.exec(getCostCenterDistribution, [params.fiscalYearStart, params.end_date]),
    db.exec(getEncounterCostCenter, [params.fiscalYearStart, params.end_date]),
    getDistributionKey.allDistributionKey(),
  ];

  q.all(dbPromises)
    .spread((costCenter, references, accountReferences, dataDistributions, encounters, allocationKey) => {
      const config = {
        costCenter,
        references,
        accountReferences,
        dataDistributions,
        allocationKey,
        encounters,
        includeManual : params.includeManual,
      };
      const dataConfigured = setting.configuration(config);

      if (costCentersChecked.length) {
        dataConfigured.principal.forEach(item => {
          item.selected = 0;
          costCentersChecked.forEach(costCenterId => {
            if (item.id === (parseInt(costCenterId, 10))) {
              item.selected = 1;
            }
          });
        });

        dataConfigured.principalSelected = dataConfigured.principal.filter(item => {
          return item.selected;
        });
      } else {
        dataConfigured.principalSelected = dataConfigured.principal;
      }

      _.merge(data, dataConfigured);
      return reporting.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}
