/**
 * @method commitmentByEmployee
 *
 * This method makes it possible to edit the transactions relating to the payroll of employees
 * individually by employee, these are the transactions below the engagement,
 * the withholding as well as the social charges on the remuneration.
 *
 * @requires lib/util
 * @requires lib/db
 * @requires moment
 */

const moment = require('moment');
const util = require('../../../lib/util');
const db = require('../../../lib/db');

const COMMITMENT_TYPE_ID = 15;
const WITHHOLDING_TYPE_ID = 16;
const CHARGES_TYPE_ID = 17;
const DECIMAL_PRECISION = 2;

function commitmentByEmployee(employees, rubrics, configuration,
  projectId, userId, exchangeRates, currencyId) {

  const transactions = [];
  const accountPayroll = configuration[0].account_id;

  const periodPayroll = moment(configuration[0].dateTo).format('MM-YYYY');
  const datePeriodTo = moment(configuration[0].dateTo).format('YYYY-MM-DD');
  const labelPayroll = configuration[0].label;

  rubrics.forEach(rubric => {
    let exchangeRate = 1;
    // {{ exchangeRates }} contains a matrix containing the current exchange rate of all currencies
    // against the currency of the Enterprise
    exchangeRates.forEach(exchange => {
      exchangeRate = parseInt(exchange.currency_id, 10) === parseInt(rubric.currency_id, 10)
        ? exchange.rate : exchangeRate;
    });
    rubric.value /= exchangeRate;
  });

  employees.forEach(employee => {
    let employeeRubricsBenefits = [];
    let employeeRubricsWithholdings = [];
    let employeeChargesRemunerations = [];

    const rubricsForEmployee = rubrics.filter(item => (item.employee_uuid === employee.employee_uuid));
    let totalEmployeeWithholding = 0;
    let totalChargeRemuneration = 0;
    let voucherWithholding;
    let voucherChargeRemuneration;

    const paiementUuid = db.bid(employee.paiement_uuid);

    transactions.push({
      query : 'UPDATE paiement SET status_id = 3 WHERE uuid = ?',
      params : [paiementUuid],
    });

    const descriptionCommitment = `ENGAGEMENT DE PAIE [${periodPayroll}]/ ${labelPayroll}/ ${employee.display_name}`;
    const descriptionWithholding = `RETENUE DU PAIEMENT [${periodPayroll}]/ ${labelPayroll}/ ${employee.display_name}`;

    // Get Rubrics benefits
    employeeRubricsBenefits = rubricsForEmployee.filter(item => (item.is_discount !== 1 && item.value > 0));

    // Get Expenses borne by the employees
    employeeRubricsWithholdings = rubricsForEmployee.filter(item => (
      item.is_discount && item.is_employee && item.value > 0));

    // Get Enterprise charge on remuneration
    employeeChargesRemunerations = rubricsForEmployee.filter(
      item => (item.is_employee !== 1 && item.is_discount === 1 && item.value > 0),
    );

    const commitmentUuid = util.uuid();
    const voucherCommitmentUuid = db.bid(commitmentUuid);
    const withholdingUuid = util.uuid();
    const voucherWithholdingUuid = db.bid(withholdingUuid);

    const employeeBenefitsItem = [];
    const employeeWithholdingItem = [];
    const enterpriseChargeRemunerations = [];

    // BENEFITS ITEM
    const voucherCommitment = {
      uuid : voucherCommitmentUuid,
      date : datePeriodTo,
      project_id : projectId,
      currency_id : currencyId,
      user_id : userId,
      type_id : COMMITMENT_TYPE_ID,
      description : descriptionCommitment,
      amount : employee.gross_salary,
    };

    employeeBenefitsItem.push([
      db.bid(util.uuid()),
      employee.account_id,
      0,
      employee.gross_salary,
      db.bid(voucherCommitment.uuid),
      db.bid(employee.creditor_uuid),
      descriptionCommitment,
      null,
    ]);

    employeeBenefitsItem.push([
      db.bid(util.uuid()),
      accountPayroll,
      employee.basic_salary,
      0,
      db.bid(voucherCommitment.uuid),
      null,
      descriptionCommitment,
      employee.cost_center_id,
    ]);

    if (employeeRubricsBenefits.length) {
      employeeRubricsBenefits.forEach(rub => {
        employeeBenefitsItem.push([
          db.bid(util.uuid()),
          rub.expense_account_id,
          rub.value,
          0,
          db.bid(voucherCommitment.uuid),
          null,
          descriptionCommitment,
          employee.cost_center_id,
        ]);
      });
    }

    // EMPLOYEE WITHOLDINGS
    if (employeeRubricsWithholdings.length) {
      employeeRubricsWithholdings.forEach(withholding => {
        totalEmployeeWithholding += util.roundDecimal(withholding.value, DECIMAL_PRECISION);
      });

      voucherWithholding = {
        uuid : voucherWithholdingUuid,
        date : datePeriodTo,
        project_id : projectId,
        currency_id : currencyId,
        user_id : userId,
        type_id : WITHHOLDING_TYPE_ID,
        description : descriptionWithholding,
        amount : util.roundDecimal(totalEmployeeWithholding, DECIMAL_PRECISION),
      };

      employeeWithholdingItem.push([
        db.bid(util.uuid()),
        employee.account_id,
        util.roundDecimal(totalEmployeeWithholding, DECIMAL_PRECISION),
        0,
        voucherWithholdingUuid,
        db.bid(employee.creditor_uuid),
        descriptionWithholding,
        null,
      ]);

      employeeRubricsWithholdings.forEach(withholding => {
        const employeeCreditorUuid = withholding.is_associated_employee === 1 ? db.bid(employee.creditor_uuid) : null;
        employeeWithholdingItem.push([
          db.bid(util.uuid()),
          withholding.debtor_account_id,
          0,
          util.roundDecimal(withholding.value, DECIMAL_PRECISION),
          voucherWithholdingUuid,
          employeeCreditorUuid,
          descriptionWithholding,
          null,
        ]);
      });

    }

    // SOCIAL CHARGE ON REMUNERATION
    if (employeeChargesRemunerations.length) {
      employeeChargesRemunerations.forEach(chargesRemunerations => {
        totalChargeRemuneration += util.roundDecimal(chargesRemunerations.value, DECIMAL_PRECISION);
      });

      voucherChargeRemuneration = {
        uuid : db.bid(util.uuid()),
        date : new Date(),
        project_id : projectId,
        currency_id : employee.currency_id,
        user_id : userId,
        type_id : CHARGES_TYPE_ID,
        description : `CHARGES SOCIALES SUR REMUNERATION [${periodPayroll}]/ ${employee.display_name}`,
        amount : util.roundDecimal(totalChargeRemuneration, 2),
      };

      employeeChargesRemunerations.forEach(chargeRemuneration => {
        enterpriseChargeRemunerations.push([
          db.bid(util.uuid()),
          chargeRemuneration.debtor_account_id,
          0,
          chargeRemuneration.value,
          voucherChargeRemuneration.uuid,
          null,
          voucherChargeRemuneration.description,
          null,
        ], [
          db.bid(util.uuid()),
          chargeRemuneration.expense_account_id,
          chargeRemuneration.value,
          0,
          voucherChargeRemuneration.uuid,
          null,
          voucherChargeRemuneration.description,
          employee.cost_center_id,
        ]);
      });
    }

    // initialise the transaction handler
    transactions.push({
      query : 'INSERT INTO voucher SET ?',
      params : [voucherCommitment],
    }, {
      query : `INSERT INTO voucher_item
        (
          uuid, account_id, debit, credit, voucher_uuid, entity_uuid, description, cost_center_id
        ) VALUES ?`,
      params : [employeeBenefitsItem],
    }, {
      query : 'CALL PostVoucher(?);',
      params : [voucherCommitment.uuid],
    });

    if (employeeChargesRemunerations.length) {
      transactions.push({
        query : 'INSERT INTO voucher SET ?',
        params : [voucherChargeRemuneration],
      }, {
        query : `INSERT INTO voucher_item
          (uuid, account_id, debit, credit, voucher_uuid, entity_uuid, description, cost_center_id) VALUES ?`,
        params : [enterpriseChargeRemunerations],
      }, {
        query : 'CALL PostVoucher(?);',
        params : [voucherChargeRemuneration.uuid],
      });
    }

    if (employeeRubricsWithholdings.length) {
      transactions.push({
        query : 'INSERT INTO voucher SET ?',
        params : [voucherWithholding],
      }, {
        query : `INSERT INTO voucher_item (
            uuid, account_id, debit, credit, voucher_uuid, entity_uuid,
            description, cost_center_id
          ) VALUES ?`,
        params : [employeeWithholdingItem],
      }, {
        query : 'CALL PostVoucher(?);',
        params : [voucherWithholding.uuid],
      });
    }

  });

  return transactions;
}

exports.commitmentByEmployee = commitmentByEmployee;
