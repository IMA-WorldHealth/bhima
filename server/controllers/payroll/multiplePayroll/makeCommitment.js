/**
 *
 * @description
 * This controller makes it possible to make entries to make the payment commitment,
 *
 *
 * @requires db
 * @requires EmployeeData
 * @requires uuid
 * @requires Exchange
 * @requires q
 * @requires util
 * @requires moment 
 */

const db = require('../../../lib/db');
const EmployeeData = require('../employees');
const uuid = require('uuid/v4');
const Exchange = require('../../finance/exchange');
const q = require('q');
const util = require('../../../lib/util');
const moment = require('moment');

function config(req, res, next) {
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

        return db.exec(sqlGetRubricPayroll, [paiementUuid])
          .then((rubricPaiement) => {
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

// Make commitment of paiement
exports.config = config;
