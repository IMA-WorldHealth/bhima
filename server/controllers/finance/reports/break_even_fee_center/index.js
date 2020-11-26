const q = require('q');
const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');

const TEMPLATE = './server/controllers/finance/reports/break_even_fee_center/report.handlebars';
const AccountReference = require('../../accounts').references;
const setting = require('./setting');
const getDistributionKey = require('../../distributionFeeCenter/getDistributionKey');

// expose to the API
exports.report = report;

// default report parameters
const DEFAULT_PARAMS = {
  csvKey : 'brea_report',
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
  let getEncounterFeeCenter;
  let feeCentersChecked = [];

  if (params.feeCenters) {
    feeCentersChecked = params.feeCenters.map(item => parseInt(item, 10));
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

  const getFeeCenter = `
    SELECT fc.id, fc.label, fc.is_principal FROM fee_center AS fc ORDER BY fc.label ASC, fc.is_principal DESC
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

  if (params.type) {
    getEncounterFeeCenter = `
      SELECT sfc.fee_center_id, f.label AS feeCenter, count(pv.uuid) AS numberOfCases
      FROM patient_visit AS pv
      JOIN patient_visit_service AS pvs ON pvs.patient_visit_uuid = pv.uuid
      JOIN service_fee_center AS sfc ON sfc.service_uuid = pvs.service_uuid
      JOIN fee_center AS f ON f.id = sfc.fee_center_id
      WHERE DATE(pv.start_date) >= DATE(?) AND DATE(pv.start_date) <= DATE(?)
      GROUP BY sfc.fee_center_id
    `;
  } else {
    getEncounterFeeCenter = `
      SELECT sfc.fee_center_id, f.label AS feeCenter,
      SUM(hi.total_hospitalized_patient + hi.total_external_patient) AS numberOfCases
      FROM indicator AS i
      JOIN hospitalization_indicator AS hi ON hi.indicator_uuid = i.uuid
      JOIN period AS p ON p.id = i.period_id
      JOIN service_fee_center AS sfc ON sfc.service_uuid = i.service_uuid
      JOIN fee_center AS f ON f.id = sfc.fee_center_id
      WHERE DATE(p.start_date) >= DATE(?) AND DATE(p.end_date) <= DATE(?)
      GROUP BY sfc.fee_center_id;
    `;
  }

  const dbPromises = [
    db.exec(getFeeCenter),
    db.exec(getFeeCenterReference),
    AccountReference.computeAllAccountReference(params.period_id),
    db.exec(getFeeCenterDistribution, [params.fiscalYearStart, params.end_date]),
    db.exec(getEncounterFeeCenter, [params.fiscalYearStart, params.end_date]),
    getDistributionKey.allDistributionKey(),
  ];

  q.all(dbPromises)
    .spread((feeCenter, references, accountReferences, dataDistributions, encounters, distributionKey) => {
      const config = {
        feeCenter,
        references,
        accountReferences,
        dataDistributions,
        distributionKey,
        encounters,
        includeManual : params.includeManual,
      };
      const dataConfigured = setting.configuration(config);

      if (feeCentersChecked.length) {
        dataConfigured.principal.forEach(item => {
          item.selected = 0;
          feeCentersChecked.forEach(feeCenterId => {
            if (item.id === (parseInt(feeCenterId, 10))) {
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
