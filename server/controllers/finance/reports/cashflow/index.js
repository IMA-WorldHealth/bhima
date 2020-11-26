/**
 * Cashflow Controller
 *
 *
 * This controller is responsible for processing cashflow report.
 *
 * @module finance/cashflow
 *
 * @requires lodash
 * @requires lib/db
 * @requires lib/ReportManager
 * @requires config/identifiers
 * @requires lib/errors/BadRequest
 */
const _ = require('lodash');

const db = require('../../../../lib/db');
const Fiscal = require('../../fiscal');
const ReportManager = require('../../../../lib/ReportManager');
const BadRequest = require('../../../../lib/errors/BadRequest');

const TEMPLATE = './server/controllers/finance/reports/cashflow/report.handlebars';
const TEMPLATE_BY_SERVICE = './server/controllers/finance/reports/cashflow/reportByService.handlebars';

// expose to the API
exports.report = report;
exports.byService = reportByService;
exports.reporting = reporting;

/**
 * @function reportByService
 *
 * @description
 * Called "Journal de Ventilation" in French.  Creates a pivot table of cash receipts
 * divided out by the services that received in the income.  Rows are payments, columns
 * are hospital service departments.
 */
async function reportByService(req, res, next) {
  const dateFrom = new Date(req.query.dateFrom);
  const dateTo = new Date(req.query.dateTo);
  const cashboxAccountId = req.query.cashboxId;

  let serviceReport;

  const options = _.clone(req.query);

  _.extend(options, {
    filename : 'TREE.CASHFLOW_BY_SERVICE',
    csvKey : 'matrix',
    orientation : 'landscape',
  });

  try {
    serviceReport = new ReportManager(TEMPLATE_BY_SERVICE, req.session, options);
  } catch (e) {
    next(e);
    return;
  }

  const tableQuery = `
    cash JOIN cash_item ON cash.uuid = cash_item.cash_uuid
      JOIN invoice ON cash_item.invoice_uuid = invoice.uuid
      JOIN service ON service.uuid = invoice.service_uuid
  `;

  const whereQuery = `
    WHERE cash.is_caution = 0 AND cash.reversed = 0
      AND DATE(cash.date) >= DATE(?) AND DATE(cash.date) <= DATE(?)
      AND cash.cashbox_id = ? AND cash.currency_id = ?
  `;

  const pivotQuery = `
    CALL Pivot('${tableQuery}', 'cash.uuid', 'service.name', 'cash_item.amount', "${whereQuery}", '');
  `;

  const cashboxDetailsSql = `
    SELECT cb.id, cb.label, cba.currency_id FROM cash_box cb JOIN cash_box_account_currency cba
      ON cb.id = cba.cash_box_id
    WHERE cba.id = ?;
  `;

  try {

    // pick up the cashbox's details
    const cashbox = await db.one(cashboxDetailsSql, cashboxAccountId);

    /*
     * This query returns a table like:
     * +--------------+-------------+-------------------+---------------+-----------------+-------+
     * | uuid    | Dentisterie | Pavillion Medical | Poly-Clinique | Salle D'Urgence | Total      |
     * +--------------+-------------+-------------------+---------------+-----------------+-------+
     * | binary  |  35000.0000 |            0.0000 |        0.0000 |          0.0000 | 35000.0000 |
     * | binary  |      0.0000 |         9500.0000 |        0.0000 |          0.0000 |  9500.0000 |
     * | binary  |      0.0000 |            0.0000 |        0.0000 |      20000.0000 | 20000.0000 |
     * | binary  |      0.0000 |            0.0000 |     5000.0000 |          0.0000 |  5000.0000 |
     * | NULL    |  35000.0000 |         9500.0000 |     5000.0000 |      20000.0000 | 69500.0000 |
     * +--------------+-------------+-------------------+---------------+-----------------+-------+
     */
    const [rows] = await db.exec(pivotQuery, [dateFrom, dateTo, cashbox.id, cashbox.currency_id]);
    const totals = rows.pop();
    delete totals.uuid;

    // early exit if no information got returned from our query
    if (!rows || !rows.length) {
      const rendered = await serviceReport.render({
        cashbox, dateTo, dateFrom,
      });
      res.set(rendered.headers).send(rendered.report);
      return;
    }

    // we need to supplement the pivot table with the following information -
    // patient's name, the patient's identifier
    const cashUuids = rows.map(row => row.uuid);
    const payments = await db.exec(`
      SELECT c.uuid, c.amount, dm.text as reference, em.text as patientReference, d.text as patientName
      FROM cash c JOIN  document_map dm ON c.uuid = dm.uuid
        JOIN entity_map em ON c.debtor_uuid = em.uuid
        JOIN debtor d ON c.debtor_uuid = d.uuid
      WHERE c.uuid IN (?);
    `, [cashUuids]);

    // map of uuid -> payment record
    const dictionary = _.groupBy(payments, 'uuid');

    // the sum of all cash_items does NOT have to be equal to the cash.amount,
    // since we handle gain/loss on exchange by manipulating the cash.amount.
    // In this case, the cash.amount represents the amount of money that came into
    // the cashbox, but sum of the cash_items represents that amount of money
    // attributed to each invoice (and therfore, service)
    let cumsum = 0;
    let amount = 0;

    const services = Object.keys(totals || {});

    // loop through all cash records, merging in relevant information to display on
    // pivot table
    const matrix = rows.map(row => {
      // grab the payment from the eictionary
      const [payment] = dictionary[row.uuid];

      // calculate the cumulative sum of allocated monies
      cumsum += row.Total;

      // calculate the sum of total amount (which might be
      // different from cumsum)
      amount += payment.amount;

      // grab matrix values
      const values = services.map(key => row[key]);
      const patient = `${payment.patientReference} - ${payment.patientName}`;
      return [payment.reference, patient, ...values, cumsum];
    });

    // if the total amount received is not the same as total amount allocated
    // to each service, we have had gain/loss on exchange. We will add a final line
    // that represents the gain/loss on exchange to our table.
    const gainOrLossOnExchange = (amount - cumsum);
    Object.assign(totals, { cumsum : cumsum + gainOrLossOnExchange });

    const rendered = await serviceReport.render({
      matrix, totals, cashbox, dateTo, dateFrom, services, gainOrLossOnExchange,
    });

    res.set(rendered.headers).send(rendered.report);
  } catch (e) {
    next(e);
  }
}

/**
 * This function get periodic balances by transaction type
 * reporting transaction type balance detailled by accounts
 * with their balance for each transaction type
 */
function report(req, res, next) {
  let serviceReport;
  const dateFrom = new Date(req.query.dateFrom);
  const dateTo = new Date(req.query.dateTo);
  const options = _.clone(req.query);
  const data = {};

  data.detailledReport = parseInt(req.query.detailed, 10);

  // convert cashboxesIds parameters in array format ['', '', ...]
  // this parameter can be sent as a string or an array we force the conversion into an array
  const cashboxesIds = _.values(req.query.cashboxesIds);

  _.extend(options, { orientation : 'landscape' });

  // catch missing required parameters
  if (!dateFrom || !dateTo || !cashboxesIds.length) {
    throw new BadRequest(
      'ERRORS.BAD_REQUEST',
      'There are some missing information among dateFrom, dateTo or cashboxesId'
    );
  }

  try {
    serviceReport = new ReportManager(TEMPLATE, req.session, options);
  } catch (e) {
    next(e);
    return;
  }

  data.dateFrom = dateFrom;
  data.dateTo = dateTo;

  getCashboxesDetails(cashboxesIds)
    .then(rows => {
      data.cashboxes = rows;

      data.cashAccountIds = data.cashboxes.map(cashbox => cashbox.account_id);

      data.cashLabels = _.chain(data.cashboxes)
        .map(cashbox => `${cashbox.label}`).uniq().join(' | ')
        .value();

      data.cashLabelSymbol = _.chain(data.cashboxes)
        .map(cashbox => cashbox.symbol).uniq().join(' + ');

      data.cashLabelDetails = data.cashboxes.map(cashbox => `${cashbox.account_number} - ${cashbox.account_label}`);

      // build periods columns from calculated period
      return Fiscal.getPeriodsFromDateRange(data.dateFrom, data.dateTo);
    })
    .then(periods => {
      data.periodDates = periods.map(p => p.start_date);

      data.periods = periods.map(p => p.id);

      data.colspan = data.periods.length + 1;

      // build periods string for query
      const periodParams = [];
      const periodString = data.periods.length ? data.periods.map(periodId => {
        periodParams.push(periodId, periodId);
        return `SUM(IF(source.period_id = ?, source.balance, 0)) AS "?"`;
      }).join(',') : '"NO_PERIOD" AS period';

      const query = `
        SELECT
          source.transaction_text, source.account_label, ${periodString},
          source.transaction_type, source.transaction_type_id, source.account_id
        FROM (
          SELECT
          a.number AS account_number, a.label AS account_label,
          SUM(gl.debit_equiv - gl.credit_equiv) AS balance,
          gl.transaction_type_id, tt.type AS transaction_type, tt.text AS transaction_text,
          gl.account_id, gl.period_id
          FROM general_ledger AS gl
          JOIN account AS a ON a.id = gl.account_id
          JOIN transaction_type AS tt ON tt.id = gl.transaction_type_id
          WHERE gl.account_id IN ? AND ((DATE(gl.trans_date) >= DATE(?)) AND (DATE(gl.trans_date) <= DATE(?)))
          AND gl.transaction_type_id <> 10 AND gl.record_uuid NOT IN (
            SELECT DISTINCT gl.record_uuid
            FROM general_ledger AS gl
            WHERE gl.record_uuid IN (
              SELECT rev.uuid
              FROM (
                SELECT v.uuid FROM voucher v WHERE v.reversed = 1
                AND DATE(v.date) >= DATE(?) AND DATE(v.date) <= DATE(?) UNION
                SELECT c.uuid FROM cash c WHERE c.reversed = 1
                AND DATE(c.date) >= DATE(?) AND DATE(c.date) <= DATE(?) UNION
                SELECT i.uuid FROM invoice i WHERE i.reversed = 1
                AND DATE(i.date) >= DATE(?) AND DATE(i.date) <= DATE(?)
              ) AS rev
            )
          ) GROUP BY gl.transaction_type_id, gl.account_id, gl.period_id
        ) AS source
        GROUP BY transaction_type_id, account_id;
      `;

      // To obtain the detailed cashflow report, the SQL query searches all the transactions
      // concerned by the cash accounts in a sub-request, from the data coming
      // from the sub-requests excluded the transaction lines of the accounts
      // linked to the cash accounts.

      const queryDetailed = `
        SELECT
          source.transaction_text, source.account_label, ${periodString},
          source.transaction_type, source.transaction_type_id, source.account_id
        FROM (
          SELECT
          a.number AS account_number, a.label AS account_label,
          SUM(gl.credit_equiv - gl.debit_equiv) AS balance,
          gl.transaction_type_id, tt.type AS transaction_type, tt.text AS transaction_text,
          gl.account_id, gl.period_id
          FROM general_ledger AS gl
          JOIN account AS a ON a.id = gl.account_id
          JOIN transaction_type AS tt ON tt.id = gl.transaction_type_id
          WHERE gl.record_uuid IN (
            SELECT record_uuid FROM general_ledger WHERE
            account_id IN ? AND ((DATE(gl.trans_date) >= DATE(?)) AND (DATE(gl.trans_date) <= DATE(?)))
          ) AND account_id NOT IN ? AND gl.transaction_type_id <> 10 AND gl.record_uuid NOT IN (
            SELECT DISTINCT gl.record_uuid
            FROM general_ledger AS gl
            WHERE gl.record_uuid IN (
              SELECT rev.uuid
              FROM (
                SELECT v.uuid FROM voucher v WHERE v.reversed = 1
                AND DATE(v.date) >= DATE(?) AND DATE(v.date) <= DATE(?) UNION
                SELECT c.uuid FROM cash c WHERE c.reversed = 1
                AND DATE(c.date) >= DATE(?) AND DATE(c.date) <= DATE(?) UNION
                SELECT i.uuid FROM invoice i WHERE i.reversed = 1
                AND DATE(i.date) >= DATE(?) AND DATE(i.date) <= DATE(?)
              ) AS rev
            )
          ) GROUP BY gl.transaction_type_id, gl.account_id, gl.period_id
        ) AS source
        GROUP BY transaction_type_id, account_id;
      `;


      const params = [...periodParams,
        [data.cashAccountIds],
        data.dateFrom,
        data.dateTo,
        data.dateFrom,
        data.dateTo,
        data.dateFrom,
        data.dateTo,
        data.dateFrom,
        data.dateTo];

      const paramsDetailed = [...periodParams,
        [data.cashAccountIds],
        data.dateFrom,
        data.dateTo,
        [data.cashAccountIds],
        data.dateFrom,
        data.dateTo,
        data.dateFrom,
        data.dateTo,
        data.dateFrom,
        data.dateTo];

      const queryRun = data.detailledReport ? queryDetailed : query;
      const paramsRun = data.detailledReport ? paramsDetailed : params;

      return db.exec(queryRun, paramsRun);
    })
    .then(rows => {
      // split incomes from expenses
      const incomes = _.chain(rows).filter({ transaction_type : 'income' }).groupBy('transaction_text').value();
      const expenses = _.chain(rows).filter({ transaction_type : 'expense' }).groupBy('transaction_text').value();
      const others = _.chain(rows).filter({ transaction_type : 'other' }).groupBy('transaction_text').value();

      const incomeTextKeys = _.keys(incomes);
      const expenseTextKeys = _.keys(expenses);
      const otherTextKeys = _.keys(others);

      const incomeTotalByTextKeys = aggregateTotalByTextKeys(data, incomes);
      const expenseTotalByTextKeys = aggregateTotalByTextKeys(data, expenses);
      const otherTotalByTextKeys = aggregateTotalByTextKeys(data, others);

      const incomeTotal = aggregateTotal(data, incomeTotalByTextKeys);
      const expenseTotal = aggregateTotal(data, expenseTotalByTextKeys);
      const otherTotal = aggregateTotal(data, otherTotalByTextKeys);
      const totalPeriodColumn = totalPeriods(data, incomeTotal, expenseTotal, otherTotal);

      _.extend(data, {
        incomes,
        expenses,
        others,
        incomeTextKeys,
        expenseTextKeys,
        incomeTotalByTextKeys,
        expenseTotalByTextKeys,
        otherTotalByTextKeys,
        incomeTotal,
        expenseTotal,
        otherTextKeys,
        otherTotal,
        totalPeriodColumn,
      });

      return serviceReport.render(data);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();

}

/**
    * aggregateTotalByKeys
    *
    * this function process totals for incomes or expense by transaction type
    * @param {*} source
    * @param {*} sourceTotalByTextKeys
  */

function aggregateTotalByTextKeys(data, source = {}) {
  const sourceTotalByTextKeys = {};

  _.keys(source).forEach((index) => {
    const currentTransactionText = source[index] || [];
    sourceTotalByTextKeys[index] = {};

    // loop for each periods
    data.periods.forEach(periodId => {
      sourceTotalByTextKeys[index][periodId] = _.sumBy(currentTransactionText, periodId);
    });
  });
  return sourceTotalByTextKeys;
}

function aggregateTotal(data, source = {}) {
  const totals = {};
  const dataset = _.values(source);
  data.periods.forEach(periodId => {
    totals[periodId] = _.sumBy(dataset, periodId);
  });
  return totals;
}

function totalPeriods(data, incomeTotal, expenseTotal, transferTotal) {
  const total = {};
  data.periods.forEach(periodId => {
    total[periodId] = incomeTotal[periodId] + expenseTotal[periodId] + transferTotal[periodId];
  });
  return total;
}

async function reporting(options, session) {
  const dateFrom = new Date(options.dateFrom);
  const dateTo = new Date(options.dateTo);
  const data = {};

  // convert cashboxesIds parameters in array format ['', '', ...]
  // this parameter can be sent as a string or an array we force the conversion into an array
  const cashboxesIds = _.values(options.cashboxesIds);

  _.extend(options, { orientation : 'landscape' });

  // catch missing required parameters
  if (!dateFrom || !dateTo || !cashboxesIds.length) {
    throw new BadRequest(
      'ERRORS.BAD_REQUEST',
      'There are some missing information among dateFrom, dateTo or cashboxesId'
    );
  }

  const serviceReport = new ReportManager(TEMPLATE, session, options);

  data.dateFrom = dateFrom;
  data.dateTo = dateTo;

  data.cashboxes = await getCashboxesDetails(cashboxesIds);
  data.cashAccountIds = data.cashboxes.map(cashbox => cashbox.account_id);

  data.cashLabels = _.chain(data.cashboxes)
    .map(cashbox => `${cashbox.label}`).uniq().join(' | ')
    .value();

  data.cashLabelSymbol = _.chain(data.cashboxes)
    .map(cashbox => cashbox.symbol).uniq().join(' + ');

  data.cashLabelDetails = data.cashboxes.map(cashbox => `${cashbox.account_number} - ${cashbox.account_label}`);

  // build periods columns from calculated period
  const periods = await Fiscal.getPeriodsFromDateRange(data.dateFrom, data.dateTo);
  data.periodDates = periods.map(p => p.start_date);
  data.periods = periods.map(p => p.id);
  data.colspan = data.periods.length + 1;
  // build periods string for query
  const periodParams = [];
  const periodString = data.periods.length ? data.periods.map(periodId => {
    periodParams.push(periodId, periodId);
    return `SUM(IF(source.period_id = ?, source.balance, 0)) AS "?"`;
  }).join(',') : '"NO_PERIOD" AS period';

  const query = `
        SELECT
          source.transaction_text, source.account_label, ${periodString},
          source.transaction_type, source.transaction_type_id, source.account_id
        FROM (
          SELECT
          a.number AS account_number, a.label AS account_label,
          SUM(gl.debit_equiv - gl.credit_equiv) AS balance,
          gl.transaction_type_id, tt.type AS transaction_type, tt.text AS transaction_text,
          gl.account_id, gl.period_id
          FROM general_ledger AS gl
          JOIN account AS a ON a.id = gl.account_id
          JOIN transaction_type AS tt ON tt.id = gl.transaction_type_id
          WHERE gl.account_id IN ? AND ((DATE(gl.trans_date) >= DATE(?)) AND (DATE(gl.trans_date) <= DATE(?)))
          AND gl.transaction_type_id <> 10 AND gl.record_uuid NOT IN (
            SELECT DISTINCT gl.record_uuid
            FROM general_ledger AS gl
            WHERE gl.record_uuid IN (
              SELECT rev.uuid
              FROM (
                SELECT v.uuid FROM voucher v WHERE v.reversed = 1
                AND DATE(v.date) >= DATE(?) AND DATE(v.date) <= DATE(?) UNION
                SELECT c.uuid FROM cash c WHERE c.reversed = 1
                AND DATE(c.date) >= DATE(?) AND DATE(c.date) <= DATE(?) UNION
                SELECT i.uuid FROM invoice i WHERE i.reversed = 1
                AND DATE(i.date) >= DATE(?) AND DATE(i.date) <= DATE(?)
              ) AS rev
            )
          ) GROUP BY gl.transaction_type_id, gl.account_id, gl.period_id
        ) AS source
        GROUP BY transaction_type_id, account_id;
      `;

  const params = [...periodParams,
    [data.cashAccountIds],
    data.dateFrom,
    data.dateTo,
    data.dateFrom,
    data.dateTo,
    data.dateFrom,
    data.dateTo,
    data.dateFrom,
    data.dateTo];
  const rows = await db.exec(query, params);

  // split incomes from expenses
  const incomes = _.chain(rows).filter({ transaction_type : 'income' }).groupBy('transaction_text').value();
  const expenses = _.chain(rows).filter({ transaction_type : 'expense' }).groupBy('transaction_text').value();
  const others = _.chain(rows).filter({ transaction_type : 'other' }).groupBy('transaction_text').value();

  const incomeTextKeys = _.keys(incomes);
  const expenseTextKeys = _.keys(expenses);
  const otherTextKeys = _.keys(others);

  const incomeTotalByTextKeys = aggregateTotalByTextKeys(data, incomes);
  const expenseTotalByTextKeys = aggregateTotalByTextKeys(data, expenses);
  const otherTotalByTextKeys = aggregateTotalByTextKeys(data, others);

  const incomeTotal = aggregateTotal(data, incomeTotalByTextKeys);
  const expenseTotal = aggregateTotal(data, expenseTotalByTextKeys);
  const otherTotal = aggregateTotal(data, otherTotalByTextKeys);
  const totalPeriodColumn = totalPeriods(data, incomeTotal, expenseTotal, otherTotal);

  _.extend(data, {
    incomes,
    expenses,
    others,
    incomeTextKeys,
    expenseTextKeys,
    incomeTotalByTextKeys,
    expenseTotalByTextKeys,
    otherTotalByTextKeys,
    incomeTotal,
    expenseTotal,
    otherTextKeys,
    otherTotal,
    totalPeriodColumn,
  });

  return serviceReport.render(data);
}

/**
 * getCashboxesDetails
 *
 * this function returns details of cashboxe ids given
 * @param {array} cashboxesIds
 */
function getCashboxesDetails(cashboxesIds) {
  const query = `
    SELECT
      cac.currency_id, cac.account_id, c.id, c.label, cur.symbol,
      a.number AS account_number, a.label AS account_label
    FROM cash_box c
    JOIN cash_box_account_currency cac ON cac.cash_box_id = c.id
    JOIN currency cur ON cur.id = cac.currency_id
    JOIN account a ON a.id = cac.account_id
    WHERE c.id IN ? ORDER BY c.id;
  `;
  return db.exec(query, [[cashboxesIds]]);
}
