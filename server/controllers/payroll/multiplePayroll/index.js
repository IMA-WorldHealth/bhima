/**
 * Multiple Payroll Controller
 *
 * @description
 * This controller is responsible for implementing all operation on the
 * paiement table through the `/multiple_payroll` endpoint.
 * The /multiple_payroll HTTP API endpoint
 *
 *
 * @requires db
 * @requires filter
 * @requires util
 * @requires moment
 */

const db = require('../../../lib/db');
const FilterParser = require('../../../lib/filter');
const util = require('../../../lib/util');
const Exchange = require('../../finance/exchange');
const EmployeeData = require('../employees');
const uuid = require('uuid/v4');
const q = require('q');
const moment = require('moment');

/**
 * @method find
 *
 * @description
 * This method will apply filters from the options object passed in to
 * filter the purchase orders.
 */
function find(options) {

  // ensure epected options are parsed appropriately as binary
  const filters = new FilterParser(options, { tableAlias : 'payroll' });
  let statusIds = [];

  if (options.status_id) {
    statusIds = statusIds.concat(options.status_id);
  }

  const sql = `
    SELECT payroll.employee_uuid, payroll.code, payroll.date_embauche, payroll.nb_enfant, payroll.individual_salary,
     payroll.account_id, payroll.creditor_uuid, payroll.display_name, payroll.sex, payroll.uuid, 
     payroll.payroll_configuration_id, payroll.currency_id, payroll.paiement_date, payroll.base_taxable, 
     payroll.basic_salary, payroll.gross_salary, payroll.grade_salary, payroll.text, payroll.net_salary, 
     payroll.working_day, payroll.total_day, payroll.daily_salary, payroll.amount_paid,
      payroll.status_id, payroll.status, (payroll.net_salary - payroll.amount_paid) AS balance
    FROM(
      SELECT BUID(employee.uuid) AS employee_uuid, employee.code, employee.date_embauche, employee.nb_enfant, 
      employee.individual_salary, creditor_group.account_id, BUID(employee.creditor_uuid) AS creditor_uuid,
        UPPER(patient.display_name) AS display_name, patient.sex, BUID(paiement.uuid) AS uuid, 
        paiement.payroll_configuration_id,  paiement.currency_id, paiement.paiement_date, paiement.base_taxable, 
        paiement.basic_salary, paiement.gross_salary, grade.basic_salary AS grade_salary, grade.text, 
        paiement.net_salary, paiement.working_day, paiement.total_day, paiement.daily_salary, paiement.amount_paid, 
        paiement.status_id, paiement_status.text AS status
        FROM employee 
        JOIN creditor ON creditor.uuid = employee.creditor_uuid  
        JOIN creditor_group ON creditor_group.uuid = creditor.group_uuid 
        JOIN patient ON patient.uuid = employee.patient_uuid 
        JOIN grade ON employee.grade_uuid = grade.uuid
        JOIN paiement ON paiement.employee_uuid = employee.uuid
        JOIN paiement_status ON paiement_status.id = paiement.status_id
        WHERE paiement.payroll_configuration_id = '${options.payroll_configuration_id}'
      UNION 
        SELECT BUID(employee.uuid) AS employee_uuid, employee.code, employee.date_embauche, employee.nb_enfant, 
        employee.individual_salary, creditor_group.account_id, BUID(employee.creditor_uuid) AS creditor_uuid,
        UPPER(patient.display_name) AS display_name, patient.sex, NULL AS 'paiement_uuid',
        '${options.payroll_configuration_id}' AS payroll_configuration_id, '${options.currency_id}' AS currency_id, 
        NULL AS paiement_date, 0 AS base_taxable, 0 AS basic_salary, 0 AS gross_salary, 
        grade.basic_salary AS grade_salary, grade.text, 0 AS net_salary, 0 AS working_day, 0 AS total_day,
        0 AS daily_salary, 0 AS amount_paid, 1 AS status_id, 'PAYROLL_STATUS.WAITING_FOR_CONFIGURATION' AS status
        FROM employee 
        JOIN creditor ON creditor.uuid = employee.creditor_uuid  
        JOIN creditor_group ON creditor_group.uuid = creditor.group_uuid 
        JOIN patient ON patient.uuid = employee.patient_uuid 
        JOIN grade ON employee.grade_uuid = grade.uuid
        WHERE employee.uuid NOT IN (
          SELECT paiement.employee_uuid 
          FROM paiement 
          WHERE paiement.payroll_configuration_id = '${options.payroll_configuration_id}')
    ) AS payroll`;

  filters.fullText('display_name');
  filters.fullText('code');

  // Company currency filtering is optional only if you want to
  // know the currency for which the employees have been configured for payment
  if (options.filterCurrency) {
    filters.equals('currency_id');
  }

  filters.custom('status_id', 'payroll.status_id IN (?)', [statusIds]);
  filters.setOrder('ORDER BY payroll.display_name');

  const query = filters.applyQuery(sql);
  const parameters = filters.parameters();

  return db.exec(query, parameters);
}


/**
 * @method search
 * @description search Payroll Paiement
 */
function search(req, res, next) {
  find(req.query)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

function getConfigurationData(payrollConfigurationId, params) {
  const transaction = db.transaction();

  const sql = `
    SELECT config_rubric_item.id, config_rubric_item.config_rubric_id, config_rubric_item.rubric_payroll_id, 
    payroll_configuration.label AS PayrollConfig,
    rubric_payroll.* 
    FROM config_rubric_item
    JOIN rubric_payroll ON rubric_payroll.id = config_rubric_item.rubric_payroll_id
    JOIN payroll_configuration ON payroll_configuration.config_rubric_id = config_rubric_item.config_rubric_id
    WHERE payroll_configuration.id = ? AND rubric_payroll.is_percent = 0 AND rubric_payroll.is_tax = 0;
  `;

  const getPeriodOffdays = `
    SELECT offday.id, offday.date, offday.percent_pay, offday.label
    FROM offday
    WHERE offday.date >= DATE(?) AND offday.date <= DATE(?);
  `;

  const getEmployeeHoliday = `
    SELECT holiday.id, holiday.label, holiday.dateFrom, holiday.dateTo, holiday.percentage,
     BUID(holiday.employee_uuid) AS employee_uuid
    FROM holiday 
    WHERE ((DATE(holiday.dateFrom) >= DATE(?) AND DATE(holiday.dateTo) <= DATE(?)) OR
    (DATE(holiday.dateFrom) >= DATE(?) AND DATE(holiday.dateFrom) <= DATE(?)) OR
    (DATE(holiday.dateTo) >= DATE(?) AND DATE(holiday.dateTo) <= DATE(?))) AND holiday.employee_uuid = ?
  `;

  const getWeekEndConfig = `
    SELECT config_week_days.indice
    FROM payroll_configuration
    JOIN config_week_days ON config_week_days.weekend_config_id = payroll_configuration.config_weekend_id
    WHERE payroll_configuration.id = ?
  `;

  const getIprConfig = `
    SELECT taxe_ipr.id, taxe_ipr.currency_id, taxe_ipr_configuration.*
    FROM taxe_ipr
    JOIN taxe_ipr_configuration ON taxe_ipr_configuration.taxe_ipr_id = taxe_ipr.id
    JOIN payroll_configuration ON payroll_configuration.config_ipr_id = taxe_ipr.id
    WHERE payroll_configuration.id =  ?
  `;

  transaction
    .addQuery(sql, [payrollConfigurationId])
    .addQuery(getPeriodOffdays, [params.dateFrom, params.dateTo])
    .addQuery(getEmployeeHoliday, [
      params.dateFrom,
      params.dateTo,
      params.dateFrom,
      params.dateTo,
      params.dateFrom,
      params.dateTo,
      db.bid(params.employeeUuid)])
    .addQuery(getWeekEndConfig, [payrollConfigurationId])
    .addQuery(getIprConfig, [payrollConfigurationId]);

  return transaction.execute();
}

function manageConfigurationData(rows, params) {
  const offDays = rows[1];
  const weekEndDays = rows[3];
  const periodFrom = new Date(params.dateFrom);
  const periodTo = new Date(params.dateTo);

  const validOffDays = [];
  const validHolidays = [];

  offDays.forEach(offDay => {
    let invalidOffDays = false;
    const offdayIndice = new Date(offDay.date).getDay();
    weekEndDays.forEach(days => {
      if (offdayIndice === days.indice) {
        invalidOffDays = true;
      }
    });
    if (!invalidOffDays) {
      validOffDays.push(offDay);
    }
  });

  if (validOffDays.length) {
    rows.push(validOffDays);
  } else {
    rows.push([]);
  }

  const holidays = rows[2];

  holidays.forEach(holiday => {
    const from = new Date(holiday.dateFrom);
    const to = new Date(holiday.dateTo);
    let numberOfDays = 0;

    for (let day = from; day <= to; day.setDate(day.getDate() + 1)) {
      if (day >= periodFrom && day <= periodTo) {
        let invalidHoliday = false;
        const holidayIndice = new Date(day).getDay();

        weekEndDays.forEach(days => {
          if (holidayIndice === days.indice) {
            invalidHoliday = true;
          }
        });

        // Check if in a holiday period there is a offDay
        validOffDays.forEach(off => {

          const offDayCheck = moment(off.date).format('YYYY-MM-DD');
          const dayCheck = moment(day).format('YYYY-MM-DD');

          if (offDayCheck === dayCheck) {
            invalidHoliday = true;
          }
        });

        if (!invalidHoliday) {
          numberOfDays++;
          validHolidays.push(holiday);
        }
      }
      holiday.numberOfDays = numberOfDays;
    }
  });

  if (validHolidays.length) {
    rows.push(validHolidays);
  } else {
    rows.push([]);
  }

  // Get Working Days
  let workingDay = 0;

  for (let day = periodFrom; day <= periodTo; day.setDate(day.getDate() + 1)) {
    let invalidDate = false;
    const dayIndice = new Date(day).getDay();

    weekEndDays.forEach(days => {

      if (dayIndice === days.indice) {
        invalidDate = true;
      }
    });

    if (!invalidDate) {
      workingDay++;
    }
  }
  rows.push([{ working_day : workingDay }]);

  return rows;
}

function configuration(req, res, next) {
  const params = req.query;
  const payrollConfigurationId = req.params.id;

  getConfigurationData(payrollConfigurationId, params)
    .then((rows) => {
      const dataManaged = manageConfigurationData(rows, params);

      res.status(200).json(dataManaged);
    })
    .catch(next)
    .done();
}

/**
 * POST /multiple_payroll/:id/multiConfiguration
 */
function setMultiConfiguration(req, res, next) {
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

  transaction
    .addQuery(getPeriodData, [payrollConfigurationId])
    .addQuery(getRubricPayroll, [payrollConfigurationId]);

  transaction.execute()
    .then((rows) => {
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

        return Exchange.getExchangeRate(enterpriseId, employee.currency_id, new Date())
          .then((exchange) => {
            enterpriseExchangeRate = currencyId === parseInt(employee.currency_id, 10) ? 1 : exchange.rate;
            return Exchange.getExchangeRate(enterpriseId, iprCurrencyId, new Date());
          })
          .then((exchangeIpr) => {
            iprExchangeRate = exchangeIpr.rate;
            return EmployeeData.lookupEmployeeAdvantages(employee.employee_uuid);
          })
          .then((advantages) => {
            advantagesEmployee = advantages;
            return getConfigurationData(payrollConfigurationId, option);
          })
          .then((dataConfiguration) => {
            const dataManaged = manageConfigurationData(dataConfiguration, option);

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
            if (offDays.length) {
              offDays.forEach(offDay => {
                const offDaysValue = ((dailySalary * offDay.percent_pay) / 100);
                offDaysCost += offDaysValue;
                offDaysElements.push([offDay.id, offDay.percent_pay, uid, offDay.label, offDaysValue]);
              });
            }

            if (holidays.length) {
              holidays.forEach(holiday => {
                const holidayValue = ((dailySalary * holiday.percentage * holiday.numberOfDays) / 100);
                holidaysCost += holidayValue;

                holidaysElements.push([holiday.id,
                  holiday.numberOfDays,
                  holiday.percentage,
                  uid,
                  holiday.label,
                  holidayValue]);
              });
            }

            /*
            * Recalculation of base salary on the basis of any holiday or vacation period,
            * where the percentages are respectively equal to 100% of the basic salary will
            * remain equal to that defined at the level of the grade table
            */
            const totalCosts = workingDayCost + offDaysCost + holidaysCost;

            const basicSalary = util.roundDecimal(totalCosts * enterpriseExchangeRate, DECIMAL_PRECISION);

            if (rubricData.length) {
              rubricData.forEach(rubric => {
                advantagesEmployee.forEach(advantage => {
                  if (rubric.rubric_payroll_id === advantage.rubric_payroll_id) {
                    rubric.result = advantage.value * enterpriseExchangeRate;
                    rubric.result = util.roundDecimal(rubric.result, DECIMAL_PRECISION);
                  }
                });
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

            let ind = -1;
            let iprValue = 0;
            let scaleIndice;

            if (iprScales.length) {
              iprScales.forEach(scale => {
                ind++;
                if (annualCumulation > scale.tranche_annuelle_debut && annualCumulation <= scale.tranche_annuelle_fin) {
                  scaleIndice = ind;
                }
              });

              const initial = iprScales[scaleIndice].tranche_annuelle_debut;
              const rate = iprScales[scaleIndice].rate / 100;

              const cumul = (iprScales[scaleIndice - 1]) ? iprScales[scaleIndice - 1].cumul_annuel : 0;
              iprValue = (((annualCumulation - initial) * rate) + cumul) / 12;

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
              daily_salary : dailySalary,
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

/**
 * POST /multiple_payroll/:id/configuration
 */
function setConfiguration(req, res, next) {
  const data = req.body.data;
  const transaction = db.transaction();
  const currencyId = req.session.enterprise.currency_id;
  const enterpriseId = req.session.enterprise.id;

  // If tax IPR is not defined Else Use Currency ID
  const iprCurrencyId = data.iprScales.length ? data.iprScales[0].currency_id : currencyId;

  const iprScales = data.iprScales;
  const employee = data.employee;
  const payrollConfigurationId = req.params.id;
  const paiementUuid = uuid();

  const uid = db.bid(paiementUuid);

  const allRubrics = [];
  const holidaysElements = [];
  const offDaysElements = [];

  let enterpriseExchangeRate = 0;
  let iprExchangeRate = 0;

  Exchange.getExchangeRate(enterpriseId, data.currency_id, new Date())
    .then((exchange) => {
      enterpriseExchangeRate = currencyId === data.currency_id ? 1 : exchange.rate;

      return Exchange.getExchangeRate(enterpriseId, iprCurrencyId, new Date());
    })
    .then((exchangeIpr) => {
      iprExchangeRate = exchangeIpr.rate;
      const DECIMAL_PRECISION = 2;

      let offDaysCost = 0;
      let holidaysCost = 0;

      // Calcul Daily Salary
      const totalDayPeriod = data.daysPeriod.working_day;

      const dailySalary = employee.individual_salary ?
        (employee.individual_salary / totalDayPeriod) :
        (employee.basic_salary / totalDayPeriod);

      const workingDayCost = dailySalary * data.working_day;
      const nbChildren = employee.nb_enfant;

      /**
     * Some institution allocates a percentage for the offday and holiday payment,
     * the calculation of this rate is found by calculating the equivalence of the daily wage with
     * the percentage of the offday or holiday.
    */

      data.offDays.forEach(offDay => {
        const offDayValue = ((dailySalary * offDay.percent_pay) / 100);
        offDaysCost += offDayValue;

        offDaysElements.push([offDay.id, offDay.percent_pay, uid, offDay.label, offDayValue]);
      });

      data.holidays.forEach(holiday => {
        const holidayValue = ((dailySalary * holiday.percentage * holiday.numberOfDays) / 100);
        holidaysCost += holidayValue;

        holidaysElements.push([holiday.id, holiday.numberOfDays, holiday.percentage, uid, holiday.label, holidayValue]);
      });

      /*
     * Recalculation of base salary on the basis of any holiday or vacation period,
     * where the percentages are respectively equal to 100% of the basic salary will
     * remain equal to that defined at the level of the grade table BB
     */

      const totalCosts = workingDayCost + offDaysCost + holidaysCost;

      const basicSalary = util.roundDecimal((totalCosts) * enterpriseExchangeRate, DECIMAL_PRECISION);

      const sql = `
        SELECT config_rubric_item.id, config_rubric_item.config_rubric_id, config_rubric_item.rubric_payroll_id, 
        payroll_configuration.label AS PayrollConfig, rubric_payroll.* 
        FROM config_rubric_item
        JOIN rubric_payroll ON rubric_payroll.id = config_rubric_item.rubric_payroll_id
        JOIN payroll_configuration ON payroll_configuration.config_rubric_id = config_rubric_item.config_rubric_id
        WHERE payroll_configuration.id = ?;
      `;

      db.exec(sql, [payrollConfigurationId])
        .then(rubrics => {
          let sumNonTaxable = 0;
          let sumTaxable = 0;
          let sumTaxContributionEmp = 0;
          let membershipFeeEmployee = 0;

          let nonTaxables = [];
          let taxables = [];
          let taxesContributions = [];

          if (rubrics.length) {
            rubrics.forEach(rubric => {
            // Initialize values for rubrics that are not automatically calculated
              rubric.result = util.roundDecimal(data.value[rubric.abbr], DECIMAL_PRECISION);
            });

            // Filtering non-taxable Rubrics
            nonTaxables = rubrics.filter(item => item.is_social_care);

            // Filtering taxable Rubrics
            taxables = rubrics.filter(item =>
              (item.is_tax !== 1 &&
              item.is_discount !== 1 &&
              item.is_social_care !== 1 &&
              item.is_membership_fee !== 1));

            // Filtering all taxes and contributions that is calculated from the taxable base
            taxesContributions = rubrics.filter(item =>
              item.is_tax || item.is_membership_fee || item.is_discount === 1);
          }

          // Calcul value for non-taxable and automatically calculated
          if (nonTaxables.length) {
            nonTaxables.forEach(nonTaxable => {
              nonTaxable.result = nonTaxable.is_percent ?
                util.roundDecimal((basicSalary * nonTaxable.value) / 100, DECIMAL_PRECISION) :
                (nonTaxable.result || nonTaxable.value);

              sumNonTaxable += nonTaxable.result;

              allRubrics.push([uid, nonTaxable.rubric_payroll_id, nonTaxable.result]);
            });
          }

          if (taxables.length) {
            taxables.forEach(taxable => {
              taxable.result = taxable.is_percent ?
                util.roundDecimal((basicSalary * taxable.value) / 100, DECIMAL_PRECISION) :
                (taxable.result || taxable.value);

              sumTaxable += taxable.result;

              allRubrics.push([uid, taxable.rubric_payroll_id, taxable.result]);
            });
          }

          const baseTaxable = basicSalary + sumTaxable;

          const grossSalary = basicSalary + sumTaxable + sumNonTaxable;

          if (taxesContributions.length) {
            taxesContributions.forEach(taxContribution => {
              taxContribution.result = taxContribution.is_percent ?
                util.roundDecimal((baseTaxable * taxContribution.value) / 100, DECIMAL_PRECISION) :
                (taxContribution.result || taxContribution.value);

              // Recovery of the value of the Membership Fee worker share
              if (taxContribution.is_membership_fee && taxContribution.is_employee) {
                membershipFeeEmployee = taxContribution.result;
              }
            });
          }

          const baseIpr = ((baseTaxable - membershipFeeEmployee) * (iprExchangeRate / enterpriseExchangeRate));

          // Annual cumulation of Base IPR
          const annualCumulation = baseIpr * 12;

          let ind = -1;
          let iprValue = 0;
          let scaleIndice;

          if (iprScales.length) {
            iprScales.forEach(scale => {
              ind++;
              if (annualCumulation > scale.tranche_annuelle_debut && annualCumulation <= scale.tranche_annuelle_fin) {
                scaleIndice = ind;
              }
            });

            const initial = iprScales[scaleIndice].tranche_annuelle_debut;
            const rate = iprScales[scaleIndice].rate / 100;

            const cumul = (iprScales[scaleIndice - 1]) ? iprScales[scaleIndice - 1].cumul_annuel : 0;
            iprValue = (((annualCumulation - initial) * rate) + cumul) / 12;

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
                if (taxContribution.is_employee) { sumTaxContributionEmp += taxContribution.result; }

                allRubrics.push([uid, taxContribution.rubric_payroll_id, taxContribution.result]);
              });
            }
          } else if (taxesContributions.length) {
            taxesContributions.forEach(taxContribution => {
              // Calculation of the sum of taxes and membership fee borne by the employee
              if (taxContribution.is_employee) {
                sumTaxContributionEmp += taxContribution.result;
              }

              allRubrics.push([uid, taxContribution.rubric_payroll_id, taxContribution.result]);
            });

          }

          const netSalary = grossSalary - sumTaxContributionEmp;

          const paiementData = {
            uuid : uid,
            employee_uuid : db.bid(employee.uuid),
            payroll_configuration_id : payrollConfigurationId,
            currency_id : data.currency_id,
            basic_salary : basicSalary,
            base_taxable : baseTaxable,
            daily_salary : dailySalary,
            total_day : totalDayPeriod,
            working_day : data.working_day,
            gross_salary : grossSalary,
            net_salary : netSalary,
            amount_paid : 0,
            status_id : 2,
          };

          const deletePaiementData = 'DELETE FROM paiement WHERE employee_uuid = ? AND payroll_configuration_id = ?';
          const setPaiementData = 'INSERT INTO paiement SET ?';
          const setRubricPaiementData = `INSERT INTO rubric_paiement (paiement_uuid, rubric_payroll_id, value) 
            VALUES ?`;
          const setHolidayPaiement = `INSERT INTO holiday_paiement 
            (holiday_id, holiday_nbdays, holiday_percentage, paiement_uuid, label, value) VALUES ?`;
          const setOffDayPaiement = `INSERT INTO offday_paiement 
            (offday_id, offday_percentage, paiement_uuid, label, value) VALUES ?`;

          transaction
            .addQuery(deletePaiementData, [db.bid(employee.uuid), payrollConfigurationId])
            .addQuery(setPaiementData, [paiementData]);

          if (allRubrics.length) {
            transaction.addQuery(setRubricPaiementData, [allRubrics]);
          }

          if (holidaysElements.length) {
            transaction.addQuery(setHolidayPaiement, [holidaysElements]);
          }

          if (offDaysElements.length) {
            transaction.addQuery(setOffDayPaiement, [offDaysElements]);
          }

          transaction.execute()
            .then(() => {
              res.sendStatus(201);
            })
            .catch(next)
            .done();

        })
        .catch(next)
        .done();
    });
}

/**
 * POST /multiple_payroll/:id/commitment
 */
function makeCommitment(req, res, next) {
  const dataEmployees = req.body.data;
  const payrollConfigurationId = req.params.id;
  const projectId = req.session.project.id;
  const userId = req.session.user.id;

  const COMMITMENT_TYPE_ID = 15;
  const WITHHOLDING_TYPE_ID = 16;
  const CHARGES_TYPE_ID = 17;

  let transactions = [];

  const sqlGetAccountPayroll = `
    SELECT payroll_configuration.id, payroll_configuration.config_accounting_id, payroll_configuration.dateFrom, 
    payroll_configuration.dateTo, config_accounting.account_id
    FROM payroll_configuration
    JOIN config_accounting ON config_accounting.id = payroll_configuration.config_accounting_id
    WHERE payroll_configuration.id = ?
  `;

  db.exec(sqlGetAccountPayroll, [payrollConfigurationId])
    .then(account => {
      const accountPayroll = account[0].account_id;
      const periodPayroll = moment(account[0].dateFrom).format('MM-YYYY');

      q.all(dataEmployees.map((employee) => {
        const paiementUuid = db.bid(employee.uuid);
        const transac = db.transaction();

        const sqlGetRubricPayroll = `
          SELECT paiement.payroll_configuration_id, BUID(paiement.uuid) AS uuid, paiement.basic_salary, 
          BUID(paiement.employee_uuid) AS employee_uuid, 
          paiement.base_taxable, paiement.currency_id, rubric_payroll.is_employee, rubric_payroll.is_discount, 
          rubric_payroll.label, rubric_payroll.is_tax, rubric_payroll.is_social_care, rubric_payroll.is_membership_fee, 
          rubric_payroll.debtor_account_id, rubric_payroll.expense_account_id, rubric_paiement.value
          FROM paiement
          JOIN rubric_paiement ON rubric_paiement.paiement_uuid = paiement.uuid
          JOIN rubric_payroll ON rubric_payroll.id = rubric_paiement.rubric_payroll_id
          WHERE paiement.uuid = ? AND rubric_paiement.value > 0
          `;

        transac
          .addQuery(sqlGetRubricPayroll, [paiementUuid]);

        return transac.execute()
          .then((rows) => {
            const rubricPaiement = rows[0];
            let totalWithholding = 0;
            let totalChargeRemuneration = 0;

            let employeeBenefits = [];
            let employeeWithholdings = [];
            let chargeRemunerations = [];

            let voucherWithholding = {};
            let voucherChargeRemuneration = {};

            if (rubricPaiement.length) {
              // Get Employee benefits
              employeeBenefits = rubricPaiement.filter(item => (item.is_discount !== 1));

              // Get Expenses borne by the employee
              employeeWithholdings = rubricPaiement.filter(item => (item.is_discount && item.is_employee));

              // Get Enterprise charge on remuneration
              chargeRemunerations = rubricPaiement.filter(item => (item.is_employee !== 1 && item.is_discount === 1));

              employeeWithholdings.forEach(withholding => {
                totalWithholding += util.roundDecimal(withholding.value, 2);
              });

              chargeRemunerations.forEach(chargeRemuneration => {
                totalChargeRemuneration += util.roundDecimal(chargeRemuneration.value, 2);
              });
            }

            const employeeBenefitsItem = [];
            const employeeWithholdingItem = [];
            const enterpriseChargeRemunerations = [];

            const voucherCommitment = {
              uuid : db.bid(uuid()),
              date : new Date(),
              project_id : projectId,
              currency_id : employee.currency_id,
              user_id : userId,
              type_id : COMMITMENT_TYPE_ID,
              description : `ENGAGEMENT DE PAIE [${periodPayroll}]/ ${employee.display_name}`,
              amount : employee.gross_salary,
              reference_uuid : db.bid(paiementUuid),
            };

            // Benefits Item
            employeeBenefitsItem.push([
              db.bid(uuid()),
              employee.account_id,
              0,
              employee.gross_salary,
              db.bid(voucherCommitment.uuid),
              null,
            ]);

            employeeBenefitsItem.push([
              db.bid(uuid()),
              accountPayroll,
              employee.basic_salary,
              0,
              db.bid(voucherCommitment.uuid),
              db.bid(employee.creditor_uuid),
            ]);

            if (employeeBenefits.length) {
              employeeBenefits.forEach(benefits => {
                employeeBenefitsItem.push([
                  db.bid(uuid()),
                  benefits.expense_account_id,
                  benefits.value,
                  0,
                  db.bid(voucherCommitment.uuid),
                  null,
                ]);
              });
            }

            // WithholdingItem
            if (employeeWithholdings.length) {
              voucherWithholding = {
                uuid : db.bid(uuid()),
                date : new Date(),
                project_id : projectId,
                currency_id : employee.currency_id,
                user_id : userId,
                type_id : WITHHOLDING_TYPE_ID,
                description : `RETENUE DU PAIEMENT [${periodPayroll}]/ ${employee.display_name}`,
                amount : util.roundDecimal(totalWithholding, 2),
                reference_uuid : db.bid(paiementUuid),
              };

              employeeWithholdingItem.push([
                db.bid(uuid()),
                employee.account_id,
                util.roundDecimal(totalWithholding, 2),
                0,
                db.bid(voucherWithholding.uuid),
                db.bid(employee.creditor_uuid),
              ]);

              employeeWithholdings.forEach(withholding => {
                employeeWithholdingItem.push([
                  db.bid(uuid()),
                  withholding.debtor_account_id,
                  0,
                  util.roundDecimal(withholding.value, 2),
                  db.bid(voucherWithholding.uuid),
                  null,
                ]);
              });
            }

            if (chargeRemunerations.length) {
              // Social charge on remuneration
              voucherChargeRemuneration = {
                uuid : db.bid(uuid()),
                date : new Date(),
                project_id : projectId,
                currency_id : employee.currency_id,
                user_id : userId,
                type_id : CHARGES_TYPE_ID,
                description : `CHARGES SOCIALES SUR REMUNERATION [${periodPayroll}]/ ${employee.display_name}`,
                amount : util.roundDecimal(totalChargeRemuneration, 2),
                reference_uuid : db.bid(paiementUuid),
              };

              chargeRemunerations.forEach(chargeRemuneration => {
                enterpriseChargeRemunerations.push([
                  db.bid(uuid()),
                  chargeRemuneration.debtor_account_id,
                  0,
                  chargeRemuneration.value,
                  db.bid(voucherChargeRemuneration.uuid),
                  null,
                ], [
                  db.bid(uuid()),
                  chargeRemuneration.expense_account_id,
                  chargeRemuneration.value,
                  0,
                  db.bid(voucherChargeRemuneration.uuid),
                  null,
                ]);
              });
            }

            // initialise the transaction handler
            transactions = [{
              query : 'INSERT INTO voucher SET ?',
              params : [voucherCommitment],
            }, {
              query : 'INSERT INTO voucher_item (uuid, account_id, debit, credit, voucher_uuid, entity_uuid) VALUES ?',
              params : [employeeBenefitsItem],
            }, {
              query : 'CALL PostVoucher(?);',
              params : [voucherCommitment.uuid],
            }];

            if (employeeWithholdings.length) {
              transactions.push({
                query : 'INSERT INTO voucher SET ?',
                params : [voucherWithholding],
              }, {
                query : `INSERT INTO voucher_item 
                  (uuid, account_id, debit, credit, voucher_uuid, entity_uuid) VALUES ?`,
                params : [employeeWithholdingItem],
              }, {
                query : 'CALL PostVoucher(?);',
                params : [voucherWithholding.uuid],
              });
            }

            if (chargeRemunerations.length) {
              transactions.push({
                query : 'INSERT INTO voucher SET ?',
                params : [voucherChargeRemuneration],
              }, {
                query : `INSERT INTO voucher_item 
                  (uuid, account_id, debit, credit, voucher_uuid, entity_uuid) VALUES ?`,
                params : [enterpriseChargeRemunerations],
              }, {
                query : 'CALL PostVoucher(?);',
                params : [voucherChargeRemuneration.uuid],
              });
            }

            transactions.push({
              query : 'UPDATE paiement set status_id = 3 WHERE uuid = ?',
              params : [paiementUuid],
            });

            return transactions;
          });
      }))
        .then((results) => {
          const postingJournal = db.transaction();

          results.forEach(transaction => {
            transaction.forEach(item => {
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

// search Payroll Paiement
exports.search = search;

// get Payroll Rubric Configured
exports.configuration = configuration;

// Set Configuration
exports.setConfiguration = setConfiguration;

// Export function find for Multiple Payroll Report
exports.find = find;

// Put Employees on the Payment Agreement List
// Transfer of the entries in accountants for the commitment of payment
exports.makeCommitment = makeCommitment;

// Set Multi Configuration
exports.setMultiConfiguration = setMultiConfiguration;
