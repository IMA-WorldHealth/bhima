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

  params.start_date = new Date(params.start_date);
  params.end_date = new Date(params.end_date);

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

  const getEncounters = `
    SELECT count(pv.uuid) AS numberCase 
    FROM patient_visit AS pv
    WHERE DATE(pv.start_date) >= DATE(?) AND DATE(pv.start_date) <= DATE(?)   
  `;

  const dbPromises = [
    db.exec(getBreakEvenReference),
    db.exec(getEncounters, [params.fiscalYearStart, params.end_date]),
    AccountReference.computeAllAccountReference(params.period_id, BREAK_EVEN_ACCOUNT_REFERENCE_TYPE),
  ];

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
