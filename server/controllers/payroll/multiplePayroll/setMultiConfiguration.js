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

function config(req, res, next) {
  const dataEmployees = req.body.data;
  const payrollConfigurationId = req.params.id;
  const enterpriseId = req.session.enterprise.id;
  const currencyId = req.session.enterprise.currency_id;
  const DECIMAL_PRECISION = 2;
  const transaction = db.transaction();

  let enterpriseExchangeRate = 0;
  let iprExchangeRate = 0;

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

      // All Transactions
      let allTransactions = [];

      q.all(dataEmployees.map((employee) => {

        let advantagesEmployee = [];

        const option = {
          dateFrom,
          dateTo,
          employeeUuid : employee.employee_uuid,
        };

        let queries2 = [
          Exchange.getExchangeRate(enterpriseId, employee.currency_id, new Date()),
          Exchange.getExchangeRate(enterpriseId, iprCurrencyId, new Date()),
          EmployeeData.lookupEmployeeAdvantages(employee.employee_uuid),
        ];

        return q.all(queries2)
          .then(([exchange, exchangeIpr, advantages]) => {
            enterpriseExchangeRate = currencyId === parseInt(employee.currency_id, 10) ? 1 : exchange.rate;
            iprExchangeRate = exchangeIpr.rate;
            advantagesEmployee = advantages;
            return getConfig.getConfigurationData(payrollConfigurationId, option);
          })
          .then((dataConfiguration) => {

            const dataManaged = manageConfig.manageConfigurationData(dataConfiguration, option);

            const iprScales = dataManaged[4];

            const daysPeriod = dataManaged[7][0];

            const offDays = dataManaged[5];
            const holidays = dataManaged[2];

            const nbHolidays = dataManaged[6].length;
            const nbOffDays = dataManaged[5].length;

            let offDaysCost = 0;
            let holidaysCost = 0;
            let grossSalary = 0;

            let nonTaxables = [];
            let taxables = [];
            let taxesContributions = [];

            let sumNonTaxable = 0;
            let sumTaxable = 0;
            let sumTaxContributionEmp = 0;
            let membershipFeeEmployee = 0;

            const allRubrics = [];
            const holidaysElements = [];
            const offDaysElements = [];

            const paiementUuid = uuid();
            const uid = db.bid(paiementUuid);

            // Calcul Daily Salary
            const dailySalary = employee.individual_salary ?
              (employee.individual_salary / daysPeriod.working_day) : (employee.grade_salary / daysPeriod.working_day);

            const workingDays = (daysPeriod.working_day - (nbHolidays + nbOffDays));
            const workingDayCost = dailySalary * (daysPeriod.working_day - (nbHolidays + nbOffDays));

            const nbChildren = employee.nb_enfant;

            /**
            * Some institution allocates a percentage for the offday and holiday payment,
            * the calculation of this rate is found by calculating the equivalence of the daily wage with
            * the percentage of the offday or holiday.
            */
            offDays.forEach(offDay => {
              const offDaysValue = ((dailySalary * offDay.percent_pay) / 100);
              offDaysCost += offDaysValue;
              offDaysElements.push([
                offDay.id, 
                offDay.percent_pay, 
                uid, 
                offDay.label, 
                util.roundDecimal(offDaysValue * enterpriseExchangeRate, DECIMAL_PRECISION)]);
            });
            
            holidays.forEach(holiday => {
              const holidayValue = ((dailySalary * holiday.percentage * holiday.numberOfDays) / 100);
              holidaysCost += holidayValue;

              holidaysElements.push([holiday.id,
                holiday.numberOfDays,
                holiday.percentage,
                uid,
                holiday.label,
                util.roundDecimal(holidayValue * enterpriseExchangeRate, DECIMAL_PRECISION)]);
            });

            /*
            * Recalculation of base salary on the basis of any holiday or vacation period,
            * where the percentages are respectively equal to 100% of the basic salary will
            * remain equal to that defined at the level of the grade table
            */
            const totalCosts = workingDayCost + offDaysCost + holidaysCost;

            const basicSalary = util.roundDecimal(totalCosts * enterpriseExchangeRate, DECIMAL_PRECISION);

            if (rubricData.length) {
              rubricData.forEach(rubric => {
                if (advantagesEmployee.length) {
                  advantagesEmployee.forEach(advantage => {
                    if (rubric.rubric_payroll_id === advantage.rubric_payroll_id) {
                      rubric.result = advantage.value * enterpriseExchangeRate;
                      rubric.result = util.roundDecimal(rubric.result, DECIMAL_PRECISION);
                    }
                  });
                } else {
                  rubric.result = 0;
                }
              });

              // Filtering non-taxable Rubrics
              
              nonTaxables = rubricData.filter(item => item.is_social_care);

              // Filtering taxable Rubrics
              taxables = rubricData.filter(item =>
                (item.is_tax !== 1 && item.is_social_care !== 1 && item.is_membership_fee !== 1));


              // Filtering all taxes and contributions that is calculated from the taxable base
              taxesContributions = rubricData.filter(item =>
                item.is_tax || item.is_membership_fee || item.is_discount === 1);              
            }


            // Calcul value for non-taxable and automatically calculated
            if (nonTaxables.length) {
              nonTaxables.forEach(nonTaxable => {
                nonTaxable.result = nonTaxable.is_percent ?
                  util.roundDecimal((basicSalary * nonTaxable.value) / 100, DECIMAL_PRECISION) :
                  nonTaxable.result || nonTaxable.value;

                sumNonTaxable += nonTaxable.result;

                allRubrics.push([uid, nonTaxable.rubric_payroll_id, nonTaxable.result]);
              });
            }

            if (taxables.length) {
              taxables.forEach(taxable => {
                taxable.result = taxable.is_percent ?
                  util.roundDecimal((basicSalary * taxable.value) / 100, DECIMAL_PRECISION) :
                  taxable.result || taxable.value;

                sumTaxable += taxable.result;

                allRubrics.push([uid, taxable.rubric_payroll_id, taxable.result]);
              });
            }

            const baseTaxable = basicSalary + sumTaxable;

            grossSalary = basicSalary + sumTaxable + sumNonTaxable;

            if (taxesContributions.length) {
              taxesContributions.forEach(taxContribution => {
                taxContribution.result = taxContribution.is_percent ?
                  util.roundDecimal((baseTaxable * taxContribution.value) / 100, DECIMAL_PRECISION) :
                  taxContribution.result || taxContribution.value;

                // Recovery of the value of the Membership Fee worker share
                if (taxContribution.is_membership_fee && taxContribution.is_employee) {
                  membershipFeeEmployee = taxContribution.result;
                }
              });
            }

            const baseIpr = ((baseTaxable - membershipFeeEmployee) * (iprExchangeRate / enterpriseExchangeRate));

            // Annual cumulation of Base IPR
            const annualCumulation = baseIpr * 12;

            let iprValue = 0;
            let scaleIndice;

            if (iprScales.length) {
              iprValue = calculation.iprTax(annualCumulation, iprScales);

              if (nbChildren > 0) {
                iprValue -= (iprValue * (nbChildren * 2)) / 100;
              }

              // Convert IPR value in selected Currency
              iprValue = util.roundDecimal(iprValue * (enterpriseExchangeRate / iprExchangeRate), DECIMAL_PRECISION);

              if (taxesContributions.length) {
                taxesContributions.forEach(taxContribution => {
                // Set the result of IPR calculation
                  if (taxContribution.is_ipr) {
                    taxContribution.result = iprValue;
                  }

                  // Calculation of the sum of taxes and membership fee borne by the employee
                  if (taxContribution.is_employee) {
                    sumTaxContributionEmp += taxContribution.result;
                  }

                  allRubrics.push([uid, taxContribution.rubric_payroll_id, taxContribution.result]);
                });
              }
            }

            const netSalary = grossSalary - sumTaxContributionEmp;

            const paiementData = {
              uuid : uid,
              employee_uuid : db.bid(employee.employee_uuid),
              payroll_configuration_id : payrollConfigurationId,
              currency_id : employee.currency_id,
              basic_salary : basicSalary,
              daily_salary : util.roundDecimal(dailySalary * enterpriseExchangeRate, DECIMAL_PRECISION),
              base_taxable : baseTaxable,
              working_day : workingDays,
              total_day : daysPeriod.working_day,
              gross_salary : grossSalary,
              net_salary : netSalary,
              amount_paid : 0,
              status_id : 2,
            };

            const setPaiementData = 'INSERT INTO paiement SET ?';
            const setRubricPaiementData = `INSERT INTO rubric_paiement (paiement_uuid, rubric_payroll_id, value) 
              VALUES ?`;

            const setHolidayPaiement = `INSERT INTO holiday_paiement (holiday_id, holiday_nbdays, holiday_percentage, 
             paiement_uuid, label, value) VALUES ?`;

            const setOffDayPaiement = `INSERT INTO offday_paiement 
              (offday_id, offday_percentage, paiement_uuid, label, value) VALUES ?`;

            // initialise All transactions handler
            allTransactions = [{
              query : setPaiementData,
              params : [paiementData],
            }];

            if (allRubrics.length) {
              allTransactions.push({
                query : setRubricPaiementData,
                params : [allRubrics],
              });
            }

            if (holidaysElements.length) {
              allTransactions.push({
                query : setHolidayPaiement,
                params : [holidaysElements],
              });
            }

            if (offDaysElements.length) {
              allTransactions.push({
                query : setOffDayPaiement,
                params : [offDaysElements],
              });
            }

            return allTransactions;
          });
      }))
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
      });
    })
    .catch(next)
    .done();
}


// set Multi Configuration
exports.config = config;