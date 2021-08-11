const _ = require('lodash');
const Tree = require('@ima-worldhealth/tree');

const db = require('../../../../lib/db');
const util = require('../../../../lib/util');
const ReportManager = require('../../../../lib/ReportManager');

const fiscal = require('../../fiscal');

const TEMPLATE = './server/controllers/finance/reports/monthly_balance/report.handlebars';

exports.document = document;
exports.formatData = formatData;
exports.reporting = reporting;

const DECIMAL_PRECISION = 2; // ex: 12.4567 => 12.46

/**
 * @description this function helps to get html document of the report in server side
 * so that we can use it with others modules on the server side
 * @param {*} options the report options
 * @param {*} session the session
 */
async function reporting(opts, session) {
  const params = opts;

  params.currency_id = session.enterprise.currency_id;

  params.allAccount = parseInt(params.allAccount, 10);
  const accountNumber = params.allAccount ? `` : params.accountNumber;
  const accountLabel = params.allAccount ? `` : params.accountLabel;

  const options = _.extend(opts, {
    filename : 'FORM.LABELS.MONTHLY_BALANCE',
    csvKey : 'rows',
    user : session.user,
  });

  const report = new ReportManager(TEMPLATE, session, options);

  const periods = {
    periodFrom : params.period_id,
    periodTo : params.period_id,
  };

  const range = await fiscal.getDateRangeFromPeriods(periods);

  const sqlParams = [
    params.fiscal_id,
    params.period_id,
  ];

  let filterByAccount;
  if (accountNumber) {
    filterByAccount = selectAccountParent(accountNumber);
  } else {
    filterByAccount = '';
  }

  const sql = `
    SELECT ac.id, ac.number, ac.label, ac.parent, s.debit, s.credit, s.amount, s.type_id
    FROM account as ac LEFT JOIN (
      SELECT pt.debit, pt.credit, SUM(pt.debit - pt.credit) as amount, pt.account_id, act.id as type_id
      FROM period_total as pt
      JOIN account as a ON a.id = pt.account_id
      JOIN account_type as act ON act.id = a.type_id
      JOIN period as p ON  p.id = pt.period_id
      JOIN fiscal_year as fy ON fy.id = p.fiscal_year_id
      WHERE fy.id = ? AND pt.period_id = ?
      GROUP BY pt.account_id
    )s ON ac.id = s.account_id
    WHERE ac.locked = 0 ${filterByAccount}
    ORDER BY ac.number;
  `;

  const sqlSum = `
    SELECT p.id, p.start_date, SUM(pt.debit) AS debit, SUM(pt.credit) AS credit
    FROM period_total AS pt
    JOIN fiscal_year AS f ON f.id = pt.fiscal_year_id
    JOIN period AS p ON p.id = pt.period_id
    WHERE pt.fiscal_year_id = ? AND pt.period_id = ?
  `;

  const [exploitation, totalExploitation] = await Promise.all([
    db.exec(sql, sqlParams),
    db.one(sqlSum, sqlParams),
  ]);

  const rows = exploitation.length === 0 ? [] : prepareTree(exploitation, 'amount', 'debit', 'credit');

  const context = {
    exploitation : rows,
    totalExploitation,
    dateFrom : range.dateFrom,
    dateTo : range.dateTo,
    periodLabel : params.periodLabel,
    currencyId : params.currency_id,
    accountLabel,
    accountNumber,
    allAccount : params.allAccount,
  };

  formatData(context.exploitation, context.totalExploitation, DECIMAL_PRECISION);

  return report.render(context);
}

function document(req, res, next) {
  reporting(req.query, req.session)
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}

function selectAccountParent(account) {
  let sqlFilter = ``;
  const accountArray = account.split('');

  if (accountArray.length) {
    let accountFilter = ``;
    if (accountArray.length > 1) {
      for (let i = 0; i < accountArray.length; i++) {
        accountFilter += `${accountArray[i]}`;
        const conditionOr = (i < (accountArray.length - 1)) ? `OR` : ``;
        sqlFilter += `ac.number = '${accountFilter}' ${conditionOr} `;
      }
      sqlFilter = `OR (${sqlFilter})`;
    }
    sqlFilter = ` AND (ac.number LIKE '${account}%' ${sqlFilter})`;
  }

  return sqlFilter;
}

// create the tree structure, filter by property and sum nodes' summableProp
function prepareTree(data, amount, debit, credit) {
  const tree = new Tree(data);
  tree.walk(Tree.common.sumOnProperty(amount), false);
  tree.walk(Tree.common.sumOnProperty(debit), false);
  tree.walk(Tree.common.sumOnProperty(credit), false);
  tree.walk(Tree.common.computeNodeDepth);
  return tree.toArray();
}

// set the percentage of each amoun's row,
// round amounts
function formatData(result, total, decimalPrecision) {
  const _total = (total === 0) ? 1 : total;
  return result.forEach(row => {
    row.title = (row.depth < 3);
    if (row.title) {
      row.percent = util.roundDecimal(Math.abs((row.amount / _total) * 100), decimalPrecision);
    }
    row.amount = util.roundDecimal(row.amount, decimalPrecision);
  });
}
