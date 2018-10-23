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
 * @requires util
 */
const util = require('../../../lib/util');
const db = require('../../../lib/db');
const compute = require('./references.compute');

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
      GROUP_CONCAT(IF(ari.is_exception = 0, a.number, CONCAT('(sauf ', a.number, ')')) SEPARATOR ', ') AS accounts,
      GROUP_CONCAT(IF(ari.credit_balance = 0, ' ', CONCAT('(SC ', a.number, ')')) SEPARATOR ', ') AS credits,
    GROUP_CONCAT(IF(ari.debit_balance = 0, ' ', CONCAT('(SD ', a.number, ')')) SEPARATOR ', ') AS debits
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
  const {
    accounts, accountsException, accountsCreditBalance, accountsDebitBalance,
  } = record;

  const sql = 'INSERT INTO account_reference SET ?;';
  const sqlItems = 'INSERT INTO account_reference_item SET ?;';

  record.is_amo_dep = record.is_amo_dep ? 1 : 0;

  delete record.id;
  delete record.accounts;
  delete record.accountsException;
  delete record.accountsCreditBalance;
  delete record.accountsDebitBalance;

  db.exec(sql, [record])
    .then((result) => {
      accountReferenceId = result.insertId;
      accounts.forEach(accountId => {
        let isCreditor = 0;
        let isDebtor = 0;

        if (accountsCreditBalance.length) {
          accountsCreditBalance.forEach((item) => {
            if (accountId === item) {
              isCreditor = 1;
            }
          });
        }

        if (accountsDebitBalance.length) {
          accountsDebitBalance.forEach((item) => {
            if (accountId === item) {
              isDebtor = 1;
            }
          });
        }

        parameters = {
          account_reference_id : accountReferenceId,
          account_id : accountId,
          is_exception : 0,
          credit_balance : isCreditor,
          debit_balance : isDebtor,
        };

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
  const {
    accounts, accountsException, accountsCreditBalance, accountsDebitBalance,
  } = record;
  const { id } = req.params;

  const sql = 'UPDATE account_reference SET ? WHERE id = ?';
  const sqlItems = 'INSERT INTO account_reference_item SET ?;';

  record.is_amo_dep = record.is_amo_dep ? 1 : 0;

  delete record.id;
  delete record.accounts;
  delete record.accountsException;
  delete record.accountsCreditBalance;
  delete record.accountsDebitBalance;

  lookupAccountReference(id)
    .then(() => db.exec(sql, [record, id]))
    .then(() => {
      transaction.addQuery('DELETE FROM account_reference_item WHERE account_reference_id = ?;', [id]);

      // accounts to use
      accounts.forEach(accountId => {
        let isCreditor = 0;
        let isDebtor = 0;

        if (accountsCreditBalance.length) {
          accountsCreditBalance.forEach((item) => {
            if (accountId === item) {
              isCreditor = 1;
            }
          });
        }

        if (accountsDebitBalance.length) {
          accountsDebitBalance.forEach((item) => {
            if (accountId === item) {
              isDebtor = 1;
            }
          });
        }

        parameters = {
          account_reference_id : id,
          account_id : accountId,
          is_exception : 0,
          credit_balance : isCreditor,
          debit_balance : isDebtor,
        };

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
 * GET /accounts/references/values/:periodId
 *
 * @method getAllValues
 */
function getAllValues(req, res, next) {
  const params = util.convertStringToNumber(req.params);
  compute.computeAllAccountReference(params.periodId)
    .then(rows => {
      res.status(200).json(rows);
    })
    .catch(next);
}

/**
 * GET /accounts/references/values/:periodId/:abbr/:isAmoDep?
 *
 * @method getValue
 */
function getValue(req, res, next) {
  const params = util.convertStringToNumber(req.params);
  compute.computeSingleAccountReference(params.abbr, params.isAmoDep, params.periodId)
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
  const sql = 'SELECT id, abbr, description, parent, is_amo_dep FROM account_reference WHERE id = ?;';

  const sqlItems = `
    SELECT account_id FROM account_reference_item WHERE account_reference_id = ? AND is_exception = 0;`;

  const sqlExceptItems = `
    SELECT account_id FROM account_reference_item WHERE account_reference_id = ? AND is_exception = 1;`;

  const sqlCreditBalanceItems = `
    SELECT account_id FROM account_reference_item WHERE account_reference_id = ? AND credit_balance = 1;`;

  const sqlDebitBalanceItems = `
    SELECT account_id FROM account_reference_item WHERE account_reference_id = ? AND debit_balance = 1;`;

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
      return db.exec(sqlCreditBalanceItems, [id]);
    })
    .then(referenceItems => {
      glb.accountsCreditBalance = referenceItems.map(i => i.account_id);
      return db.exec(sqlDebitBalanceItems, [id]);
    })
    .then(referenceItems => {
      glb.accountsDebitBalance = referenceItems.map(i => i.account_id);

      return glb;
    });
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.detail = detail;
exports.getAllValues = getAllValues;
exports.getValue = getValue;

// expose computations for values
exports.getAccountsForReference = compute.getAccountsForReference;
exports.computeSingleAccountReference = compute.computeSingleAccountReference;
exports.getValueForReference = compute.getValueForReference;
exports.computeAllAccountReference = compute.computeAllAccountReference;
