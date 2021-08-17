/**
 * @method auxilliary
 *
 * @description
 * This function returns the accounts that will have to be distributed,
 * This function first looks for all accounts in an reference account associated with an auxiliary fee center,
 * but excludes those that are excluded in a refference account.
 */
const db = require('../../../lib/db');
const FilterParser = require('../../../lib/filter');

async function auxilliary(params) {
  params.is_principal = 0;
  params.type_id = [4, 5, 6];
  params.is_exception = 1;

  const filters = new FilterParser(params, { tableAlias : 'fee_center' });
  const filters2 = new FilterParser(params, { tableAlias : 'fee_center' });

  const sql1 = `
    SELECT fee_center.id, fee_center.label, fee_center.is_principal, reference_fee_center.account_reference_id,
    reference_fee_center.is_cost, reference_fee_center.is_variable, reference_fee_center.is_turnover,
    account_reference_item.account_id, account.number, account_reference_item.is_exception, account.type_id
    FROM fee_center
    JOIN reference_fee_center ON reference_fee_center.fee_center_id = fee_center.id
    JOIN account_reference_item
      ON account_reference_item.account_reference_id = reference_fee_center.account_reference_id
    JOIN account ON account.id = account_reference_item.account_id
  `;

  filters.equals('is_principal');
  filters.equals('fee_center_id', 'id', 'fee_center');
  filters.equals('typeFeeCenter', 'is_cost', 'reference_fee_center');
  filters.custom('type_id', 'account.type_id IN (?)', [params.type_id]);

  const query1 = filters.applyQuery(sql1);
  const parameters1 = filters.parameters();

  const sql2 = `
    SELECT fee_center.id, fee_center.label, fee_center.is_principal, reference_fee_center.account_reference_id,
    account_reference_item.account_id, account.number,
    account_reference_item.is_exception, account.type_id
    FROM fee_center
    JOIN reference_fee_center ON reference_fee_center.fee_center_id = fee_center.id
    JOIN account_reference_item
      ON account_reference_item.account_reference_id = reference_fee_center.account_reference_id
    JOIN account ON account.id = account_reference_item.account_id
    `;

  filters2.equals('typeFeeCenter', 'is_cost', 'reference_fee_center');
  filters2.equals('is_exception', 'is_exception', 'account_reference_item');

  const query2 = filters2.applyQuery(sql2);
  const parameters2 = filters2.parameters();

  const [accountsValids, accountsExceptions] = await Promise.all([
    db.exec(query1, parameters1),
    db.exec(query2, parameters2),
  ]);

  if (!accountsValids.length) {
    return [];
  }

  const tabAccountsValids = [];
  const tabAccountsExceptions = [];
  const queries = [];

  // Get the child of all accounts title definied in Account Reference Items
  accountsValids.forEach(item => {
    item.label = item.label.replace(`'`, `''`);

    tabAccountsValids.push(`(SELECT ${item.id} AS id, '${item.label}' AS label,
  ${item.is_principal} AS is_principal, ${item.is_cost} AS is_cost, ${item.is_variable} AS is_variable,
  ${item.is_turnover} AS is_turnover, ${item.account_reference_id} AS account_reference_id,
  account.id AS account_id, account.number, ${item.is_exception} AS is_exception, account.type_id
  FROM account
  WHERE account.number LIKE '${item.number}%' AND account.type_id IN (4,5))`);
  });

  const sqlGetAllAccountsValids = tabAccountsValids.join(' UNION ');

  queries.push(sqlGetAllAccountsValids);

  if (accountsExceptions.length) {
  // Get the child of all accounts title definied in Account Reference Items
    accountsExceptions.forEach(item => {
      item.label = item.label.replace(`'`, `''`);

      tabAccountsExceptions.push(`(SELECT ${item.id} AS id, '${item.label}' AS label,
    ${item.is_principal} AS is_principal,
    ${item.account_reference_id} AS account_reference_id, account.id AS account_id,
    account.number, ${item.is_exception} AS is_exception, account.type_id
    FROM account
    WHERE account.number LIKE '${item.number}%' AND account.type_id IN (4,5))`);
    });
    const sqlGetAllAccountsExceptions = tabAccountsExceptions.join(' UNION ');

    queries.push(sqlGetAllAccountsExceptions);
  }

  const [valids, exceptions] = await Promise.all(queries.map(q => db.exec(q)));

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
}

exports.auxilliary = auxilliary;
