/**
 * Accounts References Computations
 */
const db = require('../../../lib/db');
const FilterParser = require('../../../lib/filter');

/**
 * @function findFiscalYear
 * @param {number} periodId
 */
function findFiscalYear(periodId) {
  const queryFiscalYear = `
    SELECT fy.id, p.number AS period_number FROM fiscal_year fy
    JOIN period p ON p.fiscal_year_id = fy.id
    WHERE p.id = ?
  `;
  return db.one(queryFiscalYear, [periodId]);
}

/**
 * @method computeAllAccountReference
 *
 * @description
 * compute value of all account references and returns an array of all accounts reference
 * with their debit, credit and balance
 *
 * @param {number} periodId - the period needed
 */
function computeAllAccountReference(periodId, referenceTypeId) {
  const glb = {};

  const options = {
    reference_type_id : referenceTypeId,
  };

  const filters = new FilterParser(options, { tableAlias : 'ar' });

  // get all references
  const queryAccountReferences = `
    SELECT ar.id, ar.abbr, ar.description, ar.is_amo_dep, ar.reference_type_id
    FROM account_reference ar
  `;

  filters.equals('reference_type_id');

  return findFiscalYear(periodId)
    .then(fiscalYear => {
      glb.fiscalYear = fiscalYear;

      const query = filters.applyQuery(queryAccountReferences);
      const parameters = filters.parameters();

      return db.exec(query, parameters);
    })
    .then(accountReferences => {
      const dbPromises = accountReferences.map(ar => {
        return getValueForReference(
          ar.abbr,
          ar.is_amo_dep,
          ar.description,
          glb.fiscalYear.period_number,
          glb.fiscalYear.id,
        );
      });

      return Promise.all(dbPromises);
    });
}

/**
 * @method computeSingleAccountReference
 *
 * @description
 * Returns the debit, credit and balance of the account reference given as an array
 *
 * @param {string} abbr - the reference of accounts. ex. AA or AX
 * @param {number} periodId - the period needed
 * @param {boolean} isAmoDep - the concerned reference is for amortissement, depreciation or provision
 */
function computeSingleAccountReference(abbr, isAmoDep = 0, periodId) {
  const glb = {};

  const queryAccountReference = `
    SELECT id, abbr, description, is_amo_dep FROM account_reference
    WHERE abbr = ? AND is_amo_dep = ?;
  `;

  return findFiscalYear(periodId)
    .then(fiscalYear => {
      glb.fiscalYear = fiscalYear;

      return db.one(queryAccountReference, [abbr, isAmoDep]);
    })
    .then(ar => {
      return getValueForReference(
        ar.abbr,
        ar.isAmoDep,
        ar.description,
        glb.fiscalYear.period_number,
        glb.fiscalYear.id,
      );
    });
}

/**
 * @method getValueForReference
 *
 * @description
 * Returns computed value of the reference in a given period and fiscal_year
 *
 * @param {number} fiscalYearId
 * @param {number} periodNumber
 * @param {string} abbr - the reference of accounts. ex. AA or AX
 * @param {boolean} isAmoDep - the concerned reference is for amortissement, depreciation or provision
 */
function getValueForReference(abbr, isAmoDep = 0, referenceDescription, periodNumber, fiscalYearId) {
  const queryTotals = `
  SELECT abbr, is_amo_dep, description,
    IFNULL(debit, 0) AS debit, IFNULL(credit, 0) AS credit, IFNULL(balance, 0) AS balance FROM (
      SELECT ? AS abbr, ? AS is_amo_dep, ? AS description,
        SUM(IFNULL(pt.debit, 0)) AS debit, SUM(IFNULL(pt.credit, 0)) AS credit,
        SUM(IFNULL(pt.debit - pt.credit, 0)) AS balance
      FROM period_total pt
      JOIN period p ON p.id = pt.period_id
      WHERE pt.fiscal_year_id = ? AND pt.locked = 0 AND p.number BETWEEN 0 AND ? AND pt.account_id IN (?)
    )z
  `;

  return getAccountsForReference(abbr, isAmoDep)
    .then(accounts => {
      const accountIds = accounts.map(a => a.account_id);
      const parameters = [
        abbr,
        isAmoDep,
        referenceDescription,
        fiscalYearId,
        periodNumber,
        accountIds.length ? accountIds : null,
      ];
      return db.exec(queryTotals, parameters).then(values => values[0]);
    });
}

/**
 * @method getAccountsForReference
 *
 * @description
 * Returns all accounts concerned by the reference without exception accounts
 *
 * @param {string} abbr - the reference of accounts. ex. AA or AX
 * @param {boolean} isAmoDep - the concerned reference is for amortissement, depreciation or provision
 */
function getAccountsForReference(abbr, isAmoDep = 0) {
  /**
   * Get the list of accounts of the reference without excepted accounts
   * @link http://www.mysqltutorial.org/mysql-minus/
   */
  const queryAccounts = `
    SELECT includeTable.account_id, includeTable.account_number, includeTable.account_type_id,
    includeTable.hidden, includeTable.locked FROM (
      SELECT DISTINCT
        account.id AS account_id, account.number AS account_number, account.type_id AS account_type_id,
          hidden, locked FROM account
        JOIN (
          SELECT a.id, a.number FROM account a
          JOIN account_reference_item ari ON ari.account_id = a.id
          JOIN account_reference ar ON ar.id = ari.account_reference_id
          WHERE ar.abbr = ? AND ar.is_amo_dep = ? AND ari.is_exception = 0
        ) AS t ON LEFT(account.number, CHAR_LENGTH(t.number)) = t.number
    ) AS includeTable
    LEFT JOIN (
      SELECT DISTINCT
        account.id AS account_id, account.number AS account_number, account.type_id as account_type_id,
          hidden, locked FROM account
        JOIN (
          SELECT a.id, a.number FROM account a
          JOIN account_reference_item ari ON ari.account_id = a.id
          JOIN account_reference ar ON ar.id = ari.account_reference_id
          WHERE ar.abbr = ? AND ar.is_amo_dep = ? AND ari.is_exception = 1
        ) AS z ON LEFT(account.number, CHAR_LENGTH(z.number)) = z.number
    ) AS excludeTable ON excludeTable.account_id = includeTable.account_id
    WHERE excludeTable.account_id IS NULL
    ORDER BY CONVERT(includeTable.account_number, char(10));
  `;
  return db.exec(queryAccounts, [abbr, isAmoDep, abbr, isAmoDep]);
}

exports.getAccountsForReference = getAccountsForReference;
exports.computeSingleAccountReference = computeSingleAccountReference;
exports.getValueForReference = getValueForReference;
exports.computeAllAccountReference = computeAllAccountReference;
