/**
 *
 * @description
 * This controller allows to initialize the payment configuration of several employees at a time,
 * the data are calculated including the values of the rubrics defined individually by employees
 *
 * @requires db
 * @requires EmployeeData
 * @requires uuid
 * @requires Exchange
 * @requires q
 * @requires util
 */
const db = require('../../../lib/db');
const EmployeeData = require('../employees');
const uuid = require('uuid/v4');
const Exchange = require('../../finance/exchange');
const q = require('q');
const util = require('../../../lib/util');
const getConfig = require('./getConfig');
const manageConfig = require('./manageConfig');
const calculation = require('./calculation');
const payrollSettings = require('./payrollSettings');
const moment = require('moment');

function config(req, res, next) {
  const dataEmployees = req.body.data;
  const payrollConfigurationId = req.params.id;
  const enterpriseId = req.session.enterprise.id;
  const currencyId = req.session.enterprise.currency_id;
  const DECIMAL_PRECISION = 2;
  const transaction = db.transaction();
  const enterpriseExchangeRate = 0;
  const iprExchangeRate = 0;
  const getPeriodData = `
    SELECT payroll_configuration.id, payroll_configuration.dateFrom, payroll_configuration.dateTo,
      payroll_configuration.config_ipr_id, taxe_ipr.currency_id
    FROM payroll_configuration
    LEFT JOIN taxe_ipr ON taxe_ipr.id = payroll_configuration.config_ipr_id
    WHERE payroll_configuration.id = ?;
  `;
  const getRubricPayroll = `
    SELECT config_rubric_item.id, config_rubric_item.config_rubric_id, config_rubric_item.rubric_payroll_id, 
    payroll_configuration.label AS PayrollConfig, rubric_payroll.* 
    FROM config_rubric_item
    JOIN rubric_payroll ON rubric_payroll.id = config_rubric_item.rubric_payroll_id
    JOIN payroll_configuration ON payroll_configuration.config_rubric_id = config_rubric_item.config_rubric_id
    WHERE payroll_configuration.id = ?;
  `;
  const queries = q.all([
    db.exec(getPeriodData, [payrollConfigurationId]),
    db.exec(getRubricPayroll, [payrollConfigurationId]),
  ]);
  queries.then(rows => {
    const periodData = rows[0][0];
    const rubricData = rows[1];
    const iprCurrencyId = periodData.currency_id;
    const dateFrom = periodData.dateFrom;
    const dateTo = periodData.dateTo;

    return payrollSettings.setConfig(
      dataEmployees,
      rows,
      enterpriseId,
      currencyId,
      payrollConfigurationId
    );
  })
    .then((results) => {
      const postingJournal = db.transaction();
      results.forEach(transac => {
        transac.forEach(item => {
          postingJournal.addQuery(item.query, item.params);
        });
      });

      return postingJournal.execute();
    })
    .then(() => {
      res.sendStatus(201);
    })
    .catch(next)
    .done();
}
// set Multi Configuration
exports.config = config;
