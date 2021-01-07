/**
 * @method dataCommitment
 *
 * This function is used to prepare the data necessary to pass the transactions of payment encumbrance,
 * this function retrieves in parameter the list of employees, and calculates the total base salaries,
 * profit totals per employee, the totals of the retentions of the Payments by Employees, and return the lists of
 * transactions to be executed, the list of profits, retained
 *
 * @requires lib/util
 * @requires lib/db
 */

const util = require('../../../lib/util');
const db = require('../../../lib/db');

function dataCommitment(employees, exchangeRates, rubrics, identificationCommitment) {
  const transactions = [];
  let totalCommitments = 0;
  let totalBasicSalaries = 0;

  const {
    voucherCommitmentUuid,
    voucherWithholdingUuid,
    descriptionCommitment,
    descriptionWithholding,
  } = identificationCommitment;

  const employeesBenefitsItem = [];
  const employeesWithholdingItem = [];

  employees.forEach(employee => {
    const paiementUuid = db.bid(employee.paiement_uuid);

    transactions.push({
      query : 'UPDATE paiement set status_id = 3 WHERE uuid = ?',
      params : [paiementUuid],
    });

    // Exchange Rate if the employee.currency is equal enterprise currency
    let exchangeRate = 1;

    // {{ exchangeRates }} contains a matrix containing the current exchange rate of all currencies
    // against the currency of the Enterprise
    exchangeRates.forEach(exchange => {
      exchangeRate = parseInt(exchange.currency_id, 10) === parseInt(employee.currency_id, 10)
        ? exchange.rate : exchangeRate;
    });

    const conversionGrossSalary = employee.gross_salary / exchangeRate;

    // Conversion in case the employee has been configured with a currency other than the Enterprise's currency
    totalCommitments += employee.gross_salary / exchangeRate;
    totalBasicSalaries += employee.basic_salary / exchangeRate;

    const rubricsPaiement = [];
    let employeeWithholdings = [];

    employeesBenefitsItem.push([
      db.bid(util.uuid()),
      employee.account_id,
      0,
      conversionGrossSalary,
      voucherCommitmentUuid,
      db.bid(employee.creditor_uuid),
      `${descriptionCommitment} (${employee.display_name})`,
    ]);

    rubrics.forEach(rubric => {
      if (employee.employee_uuid === rubric.employee_uuid) {
        rubricsPaiement.push(rubric);
      }
    });

    let totalEmployeeWithholding = 0;

    if (rubricsPaiement.length) {
      // Get Expenses borne by the employee
      employeeWithholdings = rubricsPaiement.filter(item => (item.is_discount && item.is_employee));

      employeeWithholdings.forEach(withholding => {
        totalEmployeeWithholding += util.roundDecimal(withholding.value, 2);
      });

      employeesWithholdingItem.push([
        db.bid(util.uuid()),
        employee.account_id,
        util.roundDecimal(totalEmployeeWithholding, 2),
        0,
        voucherWithholdingUuid,
        db.bid(employee.creditor_uuid),
        `${descriptionWithholding} (${employee.display_name})`,
      ]);

      if (employeeWithholdings.length) {
        employeeWithholdings.forEach(withholding => {
          if (withholding.is_associated_employee === 1) {
            employeesWithholdingItem.push([
              db.bid(util.uuid()),
              withholding.debtor_account_id,
              0,
              util.roundDecimal(withholding.value, 2),
              voucherWithholdingUuid,
              db.bid(employee.creditor_uuid),
              `${descriptionWithholding} (${employee.display_name})`,
            ]);
          }
        });
      }
    }
  });

  const data = {
    transactions,
    employeesBenefitsItem,
    employeesWithholdingItem,
    totalCommitments,
    totalBasicSalaries,
  };

  return data;
}

exports.dataCommitment = dataCommitment;
