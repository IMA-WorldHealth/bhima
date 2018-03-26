/**
 * The /general_ledger HTTP API endpoint
 *
 * @module finance/generalLedger/
 *
 * @description
 * This module is responsible for producing the general ledger, which consists
 * of a giant matrix of the balances of each account for each period in a fiscal
 * year.  The fiscal year must be provided by the client.
 *
 * @requires lodash
 * @requires lib/db
 * @requires FilterParser
 * @requires lib/util
 */


// module dependencies
const db = require('../../../lib/db');
const FilterParser = require('../../../lib/filter');
const Tree = require('../../../lib/Tree');

// expose to the api
exports.list = list;
exports.listAccounts = listAccounts;
exports.find = find;

// expose to server controllers
exports.getAccountTotalsMatrix = getAccountTotalsMatrix;

/**
 * @function find
 *
 * @description
 * This function filters the general ledger by query parameters passed in via
 * the options object.  If no query parameters are provided, the method will
 * return all items in the general ledger
 */
function find(options) {
  const filters = new FilterParser(options, {
    tableAlias : 'gl',
  });

  const sql = `
    SELECT BUID(gl.uuid) AS uuid, gl.project_id, gl.fiscal_year_id, gl.period_id,
      gl.trans_id, gl.trans_date, BUID(gl.record_uuid) AS record_uuid,
      dm1.text AS hrRecord, gl.description, gl.account_id, gl.debit, gl.credit,
      gl.debit_equiv, gl.credit_equiv, gl.currency_id, c.name AS currencyName,
      BUID(gl.entity_uuid) AS entity_uuid, em.text AS hrEntity,
      BUID(gl.reference_uuid) AS reference_uuid, dm2.text AS hrReference,
      gl.comment, gl.origin_id, gl.user_id, gl.cc_id, gl.pc_id, pro.abbr,
      pro.name AS project_name, per.start_date AS period_start,
      per.end_date AS period_end, a.number AS account_number, a.label AS account_label, u.display_name
    FROM general_ledger gl
      JOIN project pro ON pro.id = gl.project_id
      JOIN period per ON per.id = gl.period_id
      JOIN account a ON a.id = gl.account_id
      JOIN user u ON u.id = gl.user_id
      JOIN currency c ON c.id = gl.currency_id
      LEFT JOIN entity_map em ON em.uuid = gl.entity_uuid
      LEFT JOIN document_map dm1 ON dm1.uuid = gl.record_uuid
      LEFT JOIN document_map dm2 ON dm2.uuid = gl.reference_uuid
  `;

  filters.period('period', 'trans_date');
  filters.dateFrom('custom_period_start', 'trans_date');
  filters.dateTo('custom_period_end', 'trans_date');

  filters.fullText('description');
  filters.fullText('comment');

  filters.equals('user_id');
  filters.equals('account_id');
  filters.equals('project_id');
  filters.equals('trans_id');
  filters.equals('origin_id');

  filters.custom('uuids', ' gl.uuid IN (?)', [options.uuids]);
  filters.custom('amount', '(credit_equiv = ? OR debit_equiv = ?)', [options.amount, options.amount]);

  filters.setOrder('ORDER BY gl.trans_date DESC');

  const query = filters.applyQuery(sql);

  const parameters = filters.parameters();
  return db.exec(query, parameters);
}

/**
 * GET /general_ledger
 * Getting data from the general ledger
 */
function list(req, res, next) {
  find(req.query)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next);
}

/**
 * @function listAccounts
 *
 * @description
 * List accounts and their balances.
 * GET /general_ledger/accounts
 */
function listAccounts(req, res, next) {
  const fiscalYearId = req.query.fiscal_year_id;

  getAccountTotalsMatrix(fiscalYearId)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

const PERIODS = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
];


/**
 * @function getAccountTotalsMatrix
 *
 * @description
 * This function gets the period totals for all accounts in a single fiscal
 * year.  Returns only accounts (and their parents) that contain balances.
 */
function getAccountTotalsMatrix(fiscalYearId) {
  // this creates a series of columns that only sum values if they are in the
  // correct period.
  const columns = PERIODS.reduce(
    (q, number) => `${q}, SUM(IF(p.number = ${number}, pt.debit - pt.credit, 0)) AS balance${number}`,
    ''
  );

  const outerColumns =
    PERIODS.map(number => `IFNULL(s.balance${number}, 0) AS balance${number}`)
      .join(', ');

  // we want to show every single account, so we do a left join of the account
  // table
  const sql = `
    SELECT a.id, a.number, a.label, a.type_id, a.label, a.parent,
      IFNULL(s.balance, 0) AS balance, ${outerColumns}
    FROM account AS a LEFT JOIN (
      SELECT SUM(pt.debit - pt.credit) AS balance, pt.account_id ${columns}
      FROM period_total AS pt
      JOIN period AS p ON p.id = pt.period_id
      WHERE pt.fiscal_year_id = ?
      GROUP BY pt.account_id
    )s ON a.id = s.account_id
    ORDER BY a.number;
  `;

  //  returns true if all the balances are 0
  const isEmptyRow = (row) => row.balance === 0;

  return db.exec(sql, [fiscalYearId])
    .then(accounts => {
      const accountsTree = new Tree(accounts);

      // compute the values of the title accounts as the values of their children
      // takes O(n * m) time, where n is the number of nodes and m is the number
      // of periods
      const balanceKeys = ['balance', ...PERIODS.map(p => `balance${p}`)];
      const bulkSumFn = (currentNode, parentNode) => {
        balanceKeys.forEach(key => {
          parentNode[key] = (parentNode[key] || 0) + currentNode[key];
        });
      };

      accountsTree.walk(bulkSumFn, false);

      // prune empty rows
      return accountsTree.prune(isEmptyRow);
    });
}
