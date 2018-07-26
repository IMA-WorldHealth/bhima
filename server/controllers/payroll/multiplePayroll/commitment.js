/**
 * @method commitment
 *
 * This method allows you to browse the list of employees as well as the different Rubrics
 * associated with its employees to return transactions to executes in order to pass
 * the accounting transactions for the wage commitments.
 *
 * @requires util
 * @requires db
 * @requires uuid
 * @requires moment
 */

const util = require('../../../lib/util');
const db = require('../../../lib/db');
const uuid = require('uuid/v4');
const moment = require('moment');
const Exchange = require('../../finance/exchange');

const COMMITMENT_TYPE_ID = 15;
const WITHHOLDING_TYPE_ID = 16;
const CHARGES_TYPE_ID = 17;
const DECIMAL_PRECISION = 2;

function commitments(employees, rubrics, rubricsConfig, account, projectId, userId, exchangeRates, currencyId) {
  const accountPayroll = account[0].account_id;
  const periodPayroll = moment(account[0].dateFrom).format('MM-YYYY');
  const labelPayroll = account[0].label;

  let totalCommitments = 0;
  let totalBasicSalaries = 0;

  const commitmentUuid = uuid();
  const voucherCommitmentUuid = db.bid(commitmentUuid);

  const withholdingUuid = uuid();
  const voucherWithholdingUuid = db.bid(withholdingUuid);
  
  const chargeRemunerationUuid = uuid();
  const voucherChargeRemunerationUuid = db.bid(chargeRemunerationUuid);

  const transactions = [];
  const employeesBenefitsItem = [];

  let rubricsBenefits = [];
  let RubricsWithholdings = [];
  let chargeRemunerations = [];


  rubricsConfig.forEach(rubricsConfig => {
    rubricsConfig.totals = 0;

    rubrics.forEach(rubric => {
      let exchangeRate = 1;

      // {{ exchangeRates }} contains a matrix containing the current exchange rate of all currencies 
      // against the currency of the Enterprise
      exchangeRates.forEach(exchange => {
        if (parseInt(exchange.currency_id) === parseInt(rubric.currency_id)) {
          exchangeRate = exchange.rate;
        }
      })

      console.log('RUBRAAAAAAAAAaa');
      console.log(rubric);

      if (rubricsConfig.id === rubric.id) {
        rubricsConfig.totals += rubric.value / exchangeRate;
      }
    });    
  });

  // Get Rubrics benefits
  rubricsBenefits = rubricsConfig.filter(item => (item.is_discount !== 1 && item.totals > 0));

  // Get Expenses borne by the employees
  RubricsWithholdings = rubricsConfig.filter(item => (item.is_discount && item.is_employee && item.totals > 0));

  // Get Enterprise charge on remuneration
  chargeRemunerations = 
    rubricsConfig.filter(item => (item.is_employee !== 1 && item.is_discount === 1 && item.totals > 0));


  employees.forEach(employee => {
    // Exchange Rate if the employee.currency is equal enterprise currency
    let exchangeRate = 1;

    // {{ exchangeRates }} contains a matrix containing the current exchange rate of all currencies 
    // against the currency of the Enterprise
    exchangeRates.forEach(exchange => {
      if (parseInt(exchange.currency_id) === parseInt(employee.currency_id)) {
        exchangeRate = exchange.rate;
      }
    })

    const conversionGrossSalary = employee.gross_salary / exchangeRate;

    // Conversion in case the employee has been configured with a currency other than the Enterprise's currency
    totalCommitments += employee.gross_salary / exchangeRate;
    totalBasicSalaries += employee.basic_salary / exchangeRate; 

    const rubricsPaiement = [];

    employeesBenefitsItem.push([
      db.bid(uuid()),
      employee.account_id,
      0,
      conversionGrossSalary,
      voucherCommitmentUuid,
      db.bid(employee.creditor_uuid),
    ]);

    rubrics.forEach(rubric => {
      if (employee.employee_uuid === rubric.employee_uuid) {
        rubricsPaiement.push(rubric);
      }
    });
  });

  totalCommitments = util.roundDecimal(totalCommitments, DECIMAL_PRECISION);
  totalBasicSalaries = util.roundDecimal(totalBasicSalaries, DECIMAL_PRECISION);

  const voucherCommitment = {
    uuid : voucherCommitmentUuid,
    date : new Date(),
    project_id : projectId,
    currency_id : currencyId,
    user_id : userId,
    type_id : COMMITMENT_TYPE_ID,
    description : `ENGAGEMENT DE PAIE [${periodPayroll}]/ ${labelPayroll}`,
    amount : totalCommitments,
  };

  employeesBenefitsItem.push([
    db.bid(uuid()),
    accountPayroll,
    totalBasicSalaries,
    0,
    voucherCommitmentUuid,
    null,
  ]);

  if (rubricsBenefits.length) {
    rubricsBenefits.forEach(benefits => {
      employeesBenefitsItem.push([
        db.bid(uuid()),
        benefits.expense_account_id,
        benefits.value,
        0,
        voucherCommitmentUuid,
        null,
      ]);
    });
  }

  // initialise the transaction handler
  transactions.push({
    query : 'INSERT INTO voucher SET ?',
    params : [voucherCommitment],
  }, {
    query : 'INSERT INTO voucher_item (uuid, account_id, debit, credit, voucher_uuid, entity_uuid) VALUES ?',
    params : [employeesBenefitsItem],
  });




  // employees.forEach(employee => {
      // const paiementUuid = db.bid(employee.uuid);
      // const commitmentUuid = uuid();
      // const withholdingUuid = uuid();
      // const chargeRemunerationUuid = uuid();

  //   const rubricsPaiement = [];

  //   rubrics.forEach(rubric => {
  //     if (employee.employee_uuid === rubric.employee_uuid) {
  //       rubricsPaiement.push(rubric);
  //     }
  //   });

  //   let totalWithholding = 0;
  //   let totalChargeRemuneration = 0;

  //   let employeeBenefits = [];
  //   let employeeWithholdings = [];
  //   let chargeRemunerations = [];

  //   let voucherWithholding = {};
  //   let voucherChargeRemuneration = {};

  //   if (rubricsPaiement.length) {
  //     // Get Employee benefits
  //     employeeBenefits = rubricsPaiement.filter(item => (item.is_discount !== 1));

  //     // Get Expenses borne by the employee
  //     employeeWithholdings = rubricsPaiement.filter(item => (item.is_discount && item.is_employee));

  //     // Get Enterprise charge on remuneration
  //     chargeRemunerations = rubricsPaiement.filter(item => (item.is_employee !== 1 && item.is_discount === 1));

  //     employeeWithholdings.forEach(withholding => {
  //       totalWithholding += util.roundDecimal(withholding.value, 2);
  //     });

  //     chargeRemunerations.forEach(chargeRemuneration => {
  //       totalChargeRemuneration += util.roundDecimal(chargeRemuneration.value, 2);
  //     });

  //     const employeeBenefitsItem = [];
  //     const employeeWithholdingItem = [];
  //     const enterpriseChargeRemunerations = [];
  //     const voucherCommitmentUuid = db.bid(commitmentUuid);

  //     const voucherCommitment = {
  //       uuid : voucherCommitmentUuid,
  //       date : new Date(),
  //       project_id : projectId,
  //       currency_id : employee.currency_id,
  //       user_id : userId,
  //       type_id : COMMITMENT_TYPE_ID,
  //       description : `ENGAGEMENT DE PAIE [${periodPayroll}]/ ${employee.display_name}`,
  //       amount : employee.gross_salary,
  //       reference_uuid : db.bid(paiementUuid),
  //     };

  //     // Benefits Item
  //     employeeBenefitsItem.push([
  //       db.bid(uuid()),
  //       employee.account_id,
  //       0,
  //       employee.gross_salary,
  //       voucherCommitmentUuid,
  //       db.bid(employee.creditor_uuid),
  //     ]);

  //     employeeBenefitsItem.push([
  //       db.bid(uuid()),
  //       accountPayroll,
  //       employee.basic_salary,
  //       0,
  //       voucherCommitmentUuid,
  //       null,
  //     ]);

  //     if (employeeBenefits.length) {
  //       employeeBenefits.forEach(benefits => {
  //         employeeBenefitsItem.push([
  //           db.bid(uuid()),
  //           benefits.expense_account_id,
  //           benefits.value,
  //           0,
  //           voucherCommitmentUuid,
  //           null,
  //         ]);
  //       });
  //     }

  //     // WithholdingItem
  //     const voucherWithholdingUuid = db.bid(withholdingUuid);

  //     if (employeeWithholdings.length) {
  //       voucherWithholding = {
  //         uuid : voucherWithholdingUuid,
  //         date : new Date(),
  //         project_id : projectId,
  //         currency_id : employee.currency_id,
  //         user_id : userId,
  //         type_id : WITHHOLDING_TYPE_ID,
  //         description : `RETENUE DU PAIEMENT [${periodPayroll}]/ ${employee.display_name}`,
  //         amount : util.roundDecimal(totalWithholding, 2),
  //         reference_uuid : db.bid(paiementUuid),
  //       };

  //       employeeWithholdingItem.push([
  //         db.bid(uuid()),
  //         employee.account_id,
  //         util.roundDecimal(totalWithholding, 2),
  //         0,
  //         voucherWithholdingUuid,
  //         db.bid(employee.creditor_uuid),
  //       ]);

  //       employeeWithholdings.forEach(withholding => {
  //         const employeeCreditorUuid = withholding.is_associated_employee === 1
  //           ? db.bid(employee.creditor_uuid) : null;

  //         employeeWithholdingItem.push([
  //           db.bid(uuid()),
  //           withholding.debtor_account_id,
  //           0,
  //           util.roundDecimal(withholding.value, 2),
  //           voucherWithholdingUuid,
  //           employeeCreditorUuid,
  //         ]);
  //       });
  //     }

  //     const voucherChargeRemunerationUuid = db.bid(chargeRemunerationUuid);
  //     if (chargeRemunerations.length) {
  //       // Social charge on remuneration
  //       voucherChargeRemuneration = {
  //         uuid : voucherChargeRemunerationUuid,
  //         date : new Date(),
  //         project_id : projectId,
  //         currency_id : employee.currency_id,
  //         user_id : userId,
  //         type_id : CHARGES_TYPE_ID,
  //         description : `CHARGES SOCIALES SUR REMUNERATION [${periodPayroll}]/ ${employee.display_name}`,
  //         amount : util.roundDecimal(totalChargeRemuneration, 2),
  //         reference_uuid : db.bid(paiementUuid),
  //       };

  //       chargeRemunerations.forEach(chargeRemuneration => {
  //         enterpriseChargeRemunerations.push([
  //           db.bid(uuid()),
  //           chargeRemuneration.debtor_account_id,
  //           0,
  //           chargeRemuneration.value,
  //           voucherChargeRemunerationUuid,
  //           null,
  //         ], [
  //           db.bid(uuid()),
  //           chargeRemuneration.expense_account_id,
  //           chargeRemuneration.value,
  //           0,
  //           voucherChargeRemunerationUuid,
  //           null,
  //         ]);
  //       });
  //     }

      // initialise the transaction handler
      // transactions.push({
      //   query : 'INSERT INTO voucher SET ?',
      //   params : [voucherCommitment],
      // }, {
      //   query : 'INSERT INTO voucher_item (uuid, account_id, debit, credit, voucher_uuid, entity_uuid) VALUES ?',
      //   params : [employeesBenefitsItem],
      // });

  //     if (employeeWithholdings.length) {
  //       transactions.push({
  //         query : 'INSERT INTO voucher SET ?',
  //         params : [voucherWithholding],
  //       }, {
  //         query : `INSERT INTO voucher_item 
  //           (uuid, account_id, debit, credit, voucher_uuid, entity_uuid) VALUES ?`,
  //         params : [employeeWithholdingItem],
  //       });
  //     }

  //     if (chargeRemunerations.length) {
  //       transactions.push({
  //         query : 'INSERT INTO voucher SET ?',
  //         params : [voucherChargeRemuneration],
  //       }, {
  //         query : `INSERT INTO voucher_item 
  //           (uuid, account_id, debit, credit, voucher_uuid, entity_uuid) VALUES ?`,
  //         params : [enterpriseChargeRemunerations],
  //       });
  //     }

  //     transactions.push({
  //       query : 'UPDATE paiement set status_id = 3 WHERE uuid = ?',
  //       params : [paiementUuid],
  //     });
  //   }
  // });

  return transactions;
}

exports.commitments = commitments;
