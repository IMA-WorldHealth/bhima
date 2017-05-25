/**
 * The /general_ledger HTTP API endpoint
 *
 * @module finance/generalLedger/
 *
 * @description This module is responsible for handling VIEWS (different ways of seeing data) operations
 * against the general ledger table.
 *
 * @requires lodash
 * @requires lib/db
 * @requires FilterParser
 */


// module dependencies
const db = require('../../../lib/db');
const BadRequest = require('../../../lib/errors/BadRequest');
const FilterParser = require('../../../lib/filter');

// GET/ CURRENT FISCAL YEAR PERIOD
const Fiscal = require('../fiscal');

// expose to the api
exports.list = list;
exports.listAccounts = listAccounts;
exports.commentAccountStatement = commentAccountStatement;

// expose to server controllers
exports.getlistAccounts = getlistAccounts;

/**
 * @function find
 *
 * @description
 * This function filters the general ledger by query parameters passed in via
 * the options object.  If no query parameters are provided, the method will
 * return all items in the general ledger
 */
function find(options) {
  const filters = new FilterParser(options, { tableAlias : 'gl', autoParseStatements : false });

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
 * GET /general_ledger/accounts
 * list accounts and their solds
 */
function listAccounts(req, res, next) {
  const currentDate = new Date();

  Fiscal.getPeriodCurrent(currentDate)
  .then((rows) => {
    return getlistAccounts(rows);
  })
  .then((rows) => {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
 * @function getlistAccounts
 * get list of accounts
 */
function getlistAccounts(periodsId) {
  let sqlCase = '';
  let getBalance = '';
  let headSql = '';
  let signPlus = '';

  if (periodsId) {
    periodsId.forEach((period) => {
      headSql += `, balance${period.number}`;

      signPlus = period.number === 0 ? '' : '+';
      getBalance += `${signPlus} balance${period.number} `;

      sqlCase += `, SUM(CASE
          WHEN period_total.period_id = ${period.id} THEN period_total.debit - period_total.credit ELSE  0
        END) AS balance${period.number}
      `;
    });
  }

  const sql =
    `SELECT account.number, account.label, p.account_id AS id, ( ${getBalance}) AS balance ${headSql}
      FROM (
        SELECT period_total.account_id ${sqlCase}
          FROM period_total GROUP BY period_total.account_id
      ) AS p
      JOIN account ON account.id = p.account_id
      ORDER BY account.number ASC`;

  return db.exec(sql);
}

/**
 * PUT /general_ledger/comment
 * @param {object} params - { uuids: [...], comment: '' }
 */
function commentAccountStatement(req, res, next) {
  const params = req.body.params;
  const uuids = params.uuids.map((uuid) => {
    return db.bid(uuid);
  });

  const sql = 'UPDATE general_ledger SET comment = ? WHERE uuid IN ?';
  db.exec(sql, [params.comment, [uuids]])
    .then((rows) => {
      if (!rows.affectedRows || rows.affectedRows !== uuids.length) {
        throw new BadRequest('Error on update general ledger comment');
      }
      res.sendStatus(200);
    })
    .catch(next)
    .done();
}

