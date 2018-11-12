/**
 * @method auxilliary
 *
 * @description
 * This function returns the accounts that will have to be distributed,
 * This function first looks for all accounts in an reference account associated with an auxiliary fee center,
 * but excludes those that are excluded in a refference account.
 */

const q = require('q');
const db = require('../../../lib/db');
const NotFound = require('../../../lib/errors/NotFound');
const referenceAccount = require('./referenceAccount');

function auxilliary(params) {
  const typeFeeCenter = params.typeFeeCenter;
  // fee_center_id
  const filter = params.fee_center_id ? ` AND fee_center.id = ${params.fee_center_id} ` : '';

  // This request allows to recover for Fees centers auxilliary the incomes and expenses accounts associated.
  const sql1 = `
    SELECT fee_center.id, fee_center.label, fee_center.is_principal, reference_fee_center.account_reference_id, 
    account_reference_item.account_id, account.number, 
    account_reference_item.is_exception, account.type_id
    FROM fee_center
    JOIN reference_fee_center ON reference_fee_center.fee_center_id = fee_center.id
    JOIN account_reference_item 
      ON account_reference_item.account_reference_id = reference_fee_center.account_reference_id
    JOIN account ON account.id = account_reference_item.account_id
    WHERE fee_center.is_principal = 0 AND reference_fee_center.is_cost = ?
    AND account.type_id IN (4, 5, 6) AND account_reference_item.is_exception = 0 ${filter};
  `;

  const sql2 = `
    SELECT fee_center.id, fee_center.label, fee_center.is_principal, reference_fee_center.account_reference_id, 
    account_reference_item.account_id, account.number, 
    account_reference_item.is_exception, account.type_id
    FROM fee_center
    JOIN reference_fee_center ON reference_fee_center.fee_center_id = fee_center.id
    JOIN account_reference_item 
      ON account_reference_item.account_reference_id = reference_fee_center.account_reference_id
    JOIN account ON account.id = account_reference_item.account_id
    WHERE fee_center.is_principal = 0 AND reference_fee_center.is_cost = ?
    AND account_reference_item.is_exception = 1;
  `;

  return q.all([db.exec(sql1, [typeFeeCenter]), db.exec(sql2, [typeFeeCenter])])
    .spread((accountsValids, accountsExceptions) => {
      if (!accountsValids.length) {
        return [];
      }

      const tabAccountsValids = [];
      const tabAccountsExceptions = [];
      const transaction = db.transaction();

      // Get the child of all accounts title definied in Account Reference Items
      accountsValids.forEach(item => {
        tabAccountsValids.push(`(SELECT ${item.id} AS id, '${item.label}' AS label,
      ${item.is_principal} AS is_principal,
      ${item.account_reference_id} AS account_reference_id, account.id AS account_id, account.number,
      ${item.is_exception} AS is_exception, account.type_id
      FROM account
      WHERE account.number LIKE '${item.number}%' AND account.type_id IN (4,5))`);
      });
      const sqlGetAllAccountsValids = tabAccountsValids.join(' UNION ');

      transaction
        .addQuery(sqlGetAllAccountsValids);

      if (accountsExceptions.length) {
      // Get the child of all accounts title definied in Account Reference Items
        accountsExceptions.forEach(item => {
          tabAccountsExceptions.push(`(SELECT ${item.id} AS id, '${item.label}' AS label,
        ${item.is_principal} AS is_principal,
        ${item.account_reference_id} AS account_reference_id, account.id AS account_id,
        account.number, ${item.is_exception} AS is_exception, account.type_id
        FROM account
        WHERE account.number LIKE '${item.number}%' AND account.type_id IN (4,5))`);
        });

        const sqlGetAllAccountsExceptions = tabAccountsExceptions.join(' UNION ');

        transaction
          .addQuery(sqlGetAllAccountsExceptions);
      }

      return transaction.execute()
        .then((results) => {
          const valids = results[0];
          const exceptions = results[1] || [];

          const accountsReferences = valids.filter(item => {
            let isValid = true;
            if (exceptions) {
              exceptions.forEach(exception => {
                const checkAccountReference = (item.account_reference_id === exception.account_reference_id);
                const checkAccountId = (item.account_id === exception.account_id);

                if (checkAccountReference && checkAccountId) {
                  isValid = false;
                }
              });
            }
            return (isValid === true);
          });
          return accountsReferences;
        });
    });
}

exports.auxilliary = auxilliary;
