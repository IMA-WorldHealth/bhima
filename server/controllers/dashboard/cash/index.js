/**
 * API for cash dashboard
 * @requires lodash
 * @requires lib/db
 */
const Q = require('q');
const db = require('../../../lib/db');
const FilterParser = require('../../../lib/filter');

const CREDIT_NOTE_ID = 10;

// expose the API
exports.getPaymentStat = getPaymentStat;

/**
 * @method getPaymentStat
 * returns stat of cash payment grouped by hour, day of week, month of year
 */
function getPaymentStat(req, res, next) {
  const filters = new FilterParser(req.query, { tableAlias : 'cash', autoParseStatements : false });
  const reversedFilters = new FilterParser(req.query, { tableAlias : 'voucher', autoParseStatements : false });

  const amount = getAmountQuery(req.query);

  const debtorGroup = getGroupQuery(filters);

  const countByHour = getCountQuery(filters, 'CONCAT(DATE_FORMAT(created_at, "%H"), "H")', 'hour');
  const countByDayofweek = getCountQuery(filters, 'DAYOFWEEK(created_at)', 'dayofweek');
  const countByMonth = getCountQuery(filters, 'MONTH(created_at)', 'month');

  const reversedByHour = getReversedQuery(reversedFilters, 'CONCAT(DATE_FORMAT(voucher.created_at, "%H"), "H")', 'hour');
  const reversedByDayofweek = getReversedQuery(reversedFilters, 'DAYOFWEEK(voucher.created_at)', 'dayofweek');
  const reversedByMonth = getReversedQuery(reversedFilters, 'MONTH(voucher.created_at)', 'month');

  const dbPromise = [];

  // payment value
  dbPromise.push(db.exec(amount.query, amount.parameters));

  // debtor group paiement
  dbPromise.push(db.exec(debtorGroup.query, debtorGroup.parameters));

  // count hour
  dbPromise.push(db.exec(countByHour.query, countByHour.parameters));

  // count dayofweek
  dbPromise.push(db.exec(countByDayofweek.query, countByDayofweek.parameters));

  // count month
  dbPromise.push(db.exec(countByMonth.query, countByMonth.parameters));

  // reversed hour
  dbPromise.push(db.exec(reversedByHour.query, reversedByHour.parameters));

  // reversed day
  dbPromise.push(db.exec(reversedByDayofweek.query, reversedByDayofweek.parameters));

  // reversed month
  dbPromise.push(db.exec(reversedByMonth.query, reversedByMonth.parameters));

  Q.all(dbPromise)
  .spread((value, group, countHour, countDay, countMonth, reversedHour, reversedDay, reversedMonth) => {
    const bundle = {
      value, group, countHour, countDay, countMonth, reversedHour, reversedDay, reversedMonth,
    };
    res.status(200).json(bundle);
  })
  .catch(next)
  .done();
}

function getCountQuery(filters, groupBy, label) {
  const countSql = `SELECT count(*) AS count, ${groupBy} AS ${label} FROM cash`;
  filters.period('period', 'created_at');
  filters.dateFrom('custom_period_start', 'created_at');
  filters.dateTo('custom_period_end', 'created_at');
  filters.setGroup(`GROUP BY ${groupBy}`);
  const query = filters.applyQuery(countSql);
  const parameters = filters.parameters();
  return { query, parameters };
}

// FIXME: This method is huge in terms of performances
//        Need optimizations if possible
function getAmountQuery(options) {
  const pjFilters = new FilterParser(options, { tableAlias : 'posting_journal', autoParseStatements : false });
  const glFilters = new FilterParser(options, { tableAlias : 'general_ledger', autoParseStatements : false });

  const pjSql = `
    SELECT SUM(posting_journal.credit_equiv) AS value FROM posting_journal
    JOIN cash  ON cash.uuid = posting_journal.record_uuid AND cash.reversed = 0
  `;

  const glSql = `
    SELECT SUM(general_ledger.credit_equiv) AS value FROM general_ledger
    JOIN cash ON cash.uuid = general_ledger.record_uuid AND cash.reversed = 0
  `;

  pjFilters.period('period', 'trans_date', 'posting_journal');
  pjFilters.dateFrom('custom_period_start', 'trans_date', 'posting_journal');
  pjFilters.dateTo('custom_period_end', 'trans_date', 'posting_journal');

  glFilters.period('period', 'trans_date', 'general_ledger');
  glFilters.dateFrom('custom_period_start', 'trans_date', 'general_ledger');
  glFilters.dateTo('custom_period_end', 'trans_date', 'general_ledger');

  const pjQuery = pjFilters.applyQuery(pjSql);
  const pjParameters = pjFilters.parameters();

  const glQuery = glFilters.applyQuery(glSql);
  const glParameters = glFilters.parameters();

  const query = `SELECT SUM(combined_ledger.value) AS value FROM (${pjQuery} UNION ${glQuery}) AS combined_ledger;`;
  const parameters = pjParameters.concat(glParameters);

  return { query, parameters };
}

function getReversedQuery(filters, groupBy, label) {
  const countSql = `
    SELECT count(*) AS count, ${groupBy} AS ${label} FROM voucher 
    JOIN cash ON cash.uuid = voucher.reference_uuid AND voucher.type_id = ${CREDIT_NOTE_ID}
  `;
  filters.period('period', 'created_at', 'voucher');
  filters.dateFrom('custom_period_start', 'created_at', 'voucher');
  filters.dateTo('custom_period_end', 'created_at', 'voucher');
  filters.setGroup(`GROUP BY ${groupBy}`);
  const query = filters.applyQuery(countSql);
  const parameters = filters.parameters();
  return { query, parameters };
}

function getGroupQuery(filters) {
  const countSql = `
    SELECT COUNT(*) AS count, dg.name 
    FROM cash
    JOIN debtor d ON d.uuid = cash.debtor_uuid
    JOIN debtor_group dg ON dg.uuid = d.group_uuid
  `;
  filters.period('period', 'date');
  filters.dateFrom('custom_period_start', 'date');
  filters.dateTo('custom_period_end', 'date');
  filters.setGroup(`GROUP BY dg.uuid`);
  const query = filters.applyQuery(countSql);
  const parameters = filters.parameters();
  return { query, parameters };
}
