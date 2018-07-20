/**
 * @overview AccountReference
 *
 * @description
 * Implements CRUD operations on the account_reference entity.
 *
 * This module implements the following routes:
 *  GET    /accounts/references
 *  GET    /accounts/references/:id
 *  POST   /accounts/references
 *  PUT    /accounts/references/:id
 *  DELETE /accounts/references/:id
 *
 * @requires db
 * @requires NotFound
 *
 * @todo HANDLE ACCOUNT REFERENCE ITEMS
 */
const Q = require('q');
const util = require('../../../lib/util');
const db = require('../../../lib/db');

/**
 * @method detail
 *
 * @description
 * Retrieves a single account reference item from the database
 *
 * GET /accounts/references/:id
 */
function detail(req, res, next) {
  lookupAccountReference(req.params.id)
    .then((row) => {
      res.status(200).json(row);
    })
    .catch(next)
    .done();
}

/**
 * @method list
 *
 * @description
 * Lists all recorded account reference entities.
 *
 * GET /accounts/references
 */
function list(req, res, next) {
  const sql = `
    SELECT 
      ar.id, ar.abbr, ar.description, ar.parent, ar.is_amo_dep, arp.abbr as parent_abbr,
      GROUP_CONCAT(IF(ari.is_exception = 0, a.number, CONCAT('(sauf ', a.number, ')')) SEPARATOR ', ') AS accounts
    FROM account_reference ar
    LEFT JOIN account_reference arp ON arp.id = ar.parent
    LEFT JOIN account_reference_item ari ON ari.account_reference_id = ar.id
    LEFT JOIN account a ON a.id = ari.account_id
    GROUP BY ar.id;
  `;

  db.exec(sql)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}


/**
 * @method create
 *
 * @description
 * Create a new account reference entity.
 *
 * POST /accounts/references
 */
function create(req, res, next) {
  let parameters;
  let accountReferenceId;
  const transaction = db.transaction();
  const record = req.body;
  const { accounts, accountsException } = record;

  const sql = 'INSERT INTO account_reference SET ?;';
  const sqlItems = 'INSERT INTO account_reference_item SET ?;';

  record.is_amo_dep = record.is_amo_dep ? 1 : 0;

  delete record.id;
  delete record.accounts;
  delete record.accountsException;

  db.exec(sql, [record])
    .then((result) => {
      accountReferenceId = result.insertId;

      accounts.forEach(accountId => {
        parameters = { account_reference_id : accountReferenceId, account_id : accountId, is_exception : 0 };
        transaction.addQuery(sqlItems, [parameters]);
      });

      accountsException.forEach(accountId => {
        parameters = { account_reference_id : accountReferenceId, account_id : accountId, is_exception : 1 };
        transaction.addQuery(sqlItems, [parameters]);
      });

      return transaction.execute();
    })
    .then(() => {
      res.status(201).json({ id : accountReferenceId });
    })
    .catch(next)
    .done();
}

/**
 * @method update
 *
 * @description
 * Updates an account reference's properties.
 *
 * PUT /accounts/references/:id
 */
function update(req, res, next) {
  let parameters;
  const transaction = db.transaction();
  const record = req.body;
  const { accounts, accountsException } = record;
  const { id } = req.params;

  const sql = 'UPDATE account_reference SET ? WHERE id = ?';
  const sqlItems = 'INSERT INTO account_reference_item SET ?;';

  record.is_amo_dep = record.is_amo_dep ? 1 : 0;

  delete record.id;
  delete record.accounts;
  delete record.accountsException;

  lookupAccountReference(id)
    .then(() => db.exec(sql, [record, id]))
    .then(() => {
      transaction.addQuery('DELETE FROM account_reference_item WHERE account_reference_id = ?;', [id]);

      // accounts to use
      accounts.forEach(accountId => {
        parameters = { account_reference_id : id, account_id : accountId, is_exception : 0 };
        transaction.addQuery(sqlItems, [parameters]);
      });

      // accounts to skip
      accountsException.forEach(accountId => {
        parameters = { account_reference_id : id, account_id : accountId, is_exception : 1 };
        transaction.addQuery(sqlItems, [parameters]);
      });
      return transaction.execute();
    })
    .then(() => lookupAccountReference(id))
    .then((accountReference) => {
      res.status(200).json(accountReference);
    })
    .catch(next)
    .done();
}

/**
 * @method remove
*
 * @description
 * Deletes an account reference from the database
 *
 * DELETE /accounts/references/:id
 */
function remove(req, res, next) {
  const transaction = db.transaction();
  const { id } = req.params;
  const sql = 'DELETE FROM account_reference WHERE id = ?';
  const sqlItems = 'DELETE FROM account_reference_item WHERE account_reference_id = ?';

  lookupAccountReference(id)
    .then(() => {
      transaction.addQuery(sqlItems, [id]);
      transaction.addQuery(sql, [id]);
      return transaction.execute();
    })
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next)
    .done();
}

/**
 * @method getAllValues
 */
function getAllValues(req, res, next) {
  const params = util.convertStringToNumber(req.params);
  computeAllAccountReference(params.periodId)
    .then(rows => {
      res.status(200).json(rows);
    })
    .catch(next);
}

/**
 * @method getValue
 */
function getValue(req, res, next) {
  const params = util.convertStringToNumber(req.params);
  computeSingleAccountReference(params.abbr, params.isAmoDep, params.periodId)
    .then(rows => {
      res.status(200).json(rows);
    })
    .catch(next);
}

/**
 * @method lookupAccountReference
 *
 * @description
 * Retrieves an account reference by id.  If none matches, throws a NotFound error.
 *
 * @param {Number} id - the id of the account reference
 * @returns {Promise} - a promise resolving to the result of the database.
 */
function lookupAccountReference(id) {
  let glb = {};
  const sql =
    'SELECT id, abbr, description, parent, is_amo_dep FROM account_reference WHERE id = ?;';

  const sqlItems =
    'SELECT account_id FROM account_reference_item WHERE account_reference_id = ? AND is_exception = 0;';

  const sqlExceptItems =
    'SELECT account_id FROM account_reference_item WHERE account_reference_id = ? AND is_exception = 1;';

  return db.one(sql, id)
    .then(reference => {
      glb = reference;
      return db.exec(sqlItems, [id]);
    })
    .then(referenceItems => {
      glb.accounts = referenceItems.map(i => i.account_id);
      return db.exec(sqlExceptItems, [id]);
    })
    .then(referenceItems => {
      glb.accountsException = referenceItems.map(i => i.account_id);
      return glb;
    });
}

/**
 * @method computeAllAccountReference
 *
 * @description
 * compute value of all account references
 *
 * @param {number} periodId - the period needed
 */
function computeAllAccountReference(periodId) {
  const glb = {};

  // get fiscal year information for the given period
  const queryFiscalYear = `
    SELECT fy.id, p.number AS period_number FROM fiscal_year fy
    JOIN period p ON p.fiscal_year_id = fy.id
    WHERE p.id = ?
  `;

  // get all references
  const queryAccountReferences = `
    SELECT id, abbr, description, is_amo_dep FROM account_reference;
  `;

  return db.one(queryFiscalYear, [periodId])
    .then(fiscalYear => {
      glb.fiscalYear = fiscalYear;

      return db.exec(queryAccountReferences);
    })
    .then(accountReferences => {
      const dbPromises = accountReferences.map(ar => {
        return getValueForReference(ar.abbr, ar.is_amo_dep, glb.fiscalYear.period_number, glb.fiscalYear.id);
      });
      return Q.all(dbPromises);
    })
    .then(data => {
      const accountReferenceValues = data.map(line => line[0]);
      return accountReferenceValues;
    });
}

/**
 * @method computeSingleAccountReference
 *
 * @description
 * Returns the balance of the account reference given
 *
 * @param {string} abbr - the reference of accounts. ex. AA or AX
 * @param {number} periodId - the period needed
 * @param {boolean} isAmoDep - the concerned reference is for amortissement, depreciation or provision
 */
function computeSingleAccountReference(abbr, isAmoDep = 0, periodId) {
  // get fiscal year information for the given period
  const queryFiscalYear = `
    SELECT fy.id, p.number AS period_number FROM fiscal_year fy
    JOIN period p ON p.fiscal_year_id = fy.id
    WHERE p.id = ?
  `;

  return db.one(queryFiscalYear, [periodId])
    .then(fiscalYear => {
      return getValueForReference(abbr, isAmoDep, fiscalYear.period_number, fiscalYear.id);
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
function getValueForReference(abbr, isAmoDep = 0, periodNumber, fiscalYearId) {
  const queryTotals = `
  SELECT abbr, is_amo_dep, IFNULL(debit, 0) AS debit, IFNULL(credit, 0) AS credit, IFNULL(balance, 0) AS balance FROM (
    SELECT ? AS abbr, ? AS is_amo_dep, 
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
        fiscalYearId,
        periodNumber,
        accountIds.length ? accountIds : null,
      ];
      return db.exec(queryTotals, parameters);
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
   * mysql implementation of minus operator
   * @link http://www.mysqltutorial.org/mysql-minus/
   */
  const queryAccounts = `
    SELECT includeTable.account_id, includeTable.account_number FROM (
      SELECT DISTINCT 
        account.id AS account_id, account.number AS account_number, t.is_exception FROM account
        JOIN (
          SELECT a.id, a.number, ar.is_amo_dep, ari.is_exception FROM account a 
          JOIN account_reference_item ari ON ari.account_id = a.id
          JOIN account_reference ar ON ar.id = ari.account_reference_id
          WHERE ar.abbr LIKE ? AND ar.is_amo_dep = ? AND ari.is_exception = 0
        ) AS t ON LEFT(account.number, CHAR_LENGTH(t.number)) LIKE t.number 
    ) AS includeTable 
    LEFT JOIN (
      SELECT DISTINCT 
        account.id AS account_id, account.number AS account_number, z.is_exception FROM account
        JOIN (
          SELECT a.id, a.number, ar.is_amo_dep, ari.is_exception FROM account a 
          JOIN account_reference_item ari ON ari.account_id = a.id
          JOIN account_reference ar ON ar.id = ari.account_reference_id
          WHERE ar.abbr LIKE ? AND ar.is_amo_dep = ? AND ari.is_exception = 1
        ) AS z ON LEFT(account.number, CHAR_LENGTH(z.number)) LIKE z.number
    ) AS excludeTable ON excludeTable.account_id = includeTable.account_id 
    WHERE excludeTable.account_id IS NULL
    ORDER BY CONVERT(includeTable.account_number, char(10));
  `;
  return db.exec(queryAccounts, [abbr, isAmoDep, abbr, isAmoDep]);
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.detail = detail;
exports.getAllValues = getAllValues;
exports.getValue = getValue;

// expose methods
exports.getAccountsForReference = getAccountsForReference;
exports.computeSingleAccountReference = computeSingleAccountReference;
exports.getValueForReference = getValueForReference;
exports.computeAllAccountReference = computeAllAccountReference;
