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
 * This function creates a cashflow report by service, reporting the realized income
 * for the hospital services.
 *
 * @todo - factor in cash reversals.
 * @todo - factor in posting journal balances
 */
function reportByService(req, res, next) {
  const dateFrom = new Date(req.query.dateFrom);
  const dateTo = new Date(req.query.dateTo);
  const cashboxAccountId = req.query.cashboxId;

  let serviceReport;

  const options = _.clone(req.query);

  _.extend(options, {
    filename : 'TREE.CASHFLOW_BY_SERVICE',
    csvKey : 'matrix',
    orientation : 'landscape',
    footerRight : '[page] / [toPage]',
    footerFontSize : '7',
  });


  try {
    serviceReport = new ReportManager(TEMPLATE_BY_SERVICE, req.session, options);
  } catch (e) {
    next(e);
    return;
  }

  const data = {};
  data.dateFrom = dateFrom;
  data.dateTo = dateTo;

  let emptyCashValues = false;

  // get the cash flow data
  const cashflowByServiceSql = `
    SELECT uuid, reference, date, cashAmount, invoiceAmount, currency_id, service_id,
      display_name, name, (@cumsum := cashAmount + @cumsum) AS cumsum
    FROM (
      SELECT BUID(cash.uuid) AS uuid,
        dm.text AS reference, cash.date, cash.amount AS cashAmount,
        SUM(invoice.cost) AS invoiceAmount, cash.currency_id,
        service.id AS service_id, patient.display_name, service.name
      FROM cash JOIN cash_item ON cash.uuid = cash_item.cash_uuid
        JOIN invoice ON cash_item.invoice_uuid = invoice.uuid
        JOIN project ON cash.project_id = project.id
        JOIN patient ON patient.debtor_uuid = cash.debtor_uuid
        JOIN service ON invoice.service_id = service.id
        JOIN document_map dm ON dm.uuid = cash.uuid
      WHERE cash.is_caution = 0 AND cash.reversed = 0
        AND DATE(cash.date) >= DATE(?) AND DATE(cash.date) <= DATE(?)
        AND cash.cashbox_id =  ?
      GROUP BY cash.uuid
      ORDER BY cash.date, cash.reference
    )c, (SELECT @cumsum := 0)z
    ORDER BY date, reference;
  `;

  // get all service names in alphabetical order
  const serviceSql = `
    SELECT DISTINCT service.name FROM service WHERE service.id IN (?) ORDER BY name;
  `;

  // get the totals of the captured records
  const serviceAggregationSql = `
    SELECT service.name, SUM(cash.amount) AS totalCashIncome, SUM(invoice.cost) AS totalAcruelIncome
    FROM cash JOIN cash_item ON cash.uuid = cash_item.cash_uuid
      JOIN invoice ON cash_item.invoice_uuid = invoice.uuid
      JOIN service ON invoice.service_id = service.id
    WHERE cash.is_caution = 0 AND cash.reversed = 0
      AND DATE(cash.date) >= DATE(?) AND DATE(cash.date) <= DATE(?)
      AND cash.cashbox_id = ?
    GROUP BY service.name
    ORDER BY service.name;
  `;

  const cashboxDetailsSql = `
    SELECT cb.id, cb.label FROM cash_box cb JOIN cash_box_account_currency cba
      ON cb.id = cba.cash_box_id
    WHERE cba.id = ?;
  `;

  // pick up the cashbox's details
  db.one(cashboxDetailsSql, cashboxAccountId)
    .then(cashbox => {
      data.cashbox = cashbox;
      return db.exec(cashflowByServiceSql, [dateFrom, dateTo, cashbox.id]);
    })
    .then((rows) => {
      data.rows = rows;

      // return an empty array if no rows
      if (!rows.length) {
        emptyCashValues = true;
        return [];
      }

      // get a list of unique service ids
      const serviceIds = rows
        .map(row => row.service_id)
        .filter((id, index, array) => array.indexOf(id) === index);

      // execute the service SQL
      return db.exec(serviceSql, [serviceIds]);
    })
    .then((services) => {
      // if nothing matches the selection criteria, continue with nothing
      if (emptyCashValues) {
        return [];
      }

      const { rows } = data;
      delete data.rows;

      // Infer currencyId from first row.  Note that currencies are separated by
      // accounts - therefore, we will always have a uniform currency_id throughout
      // the record set.
      data.currencyId = rows[0].currency_id;

      // map services to their service names
      data.services = services.map(service => service.name);

      const xAxis = data.services.length;

      // fill the matrix with nulls except the correct columns
      const matrix = rows.map((row) => {
        // fill line with each service + two lines for cash payment identifier and patient name
        const line = _.fill(Array(xAxis + 3), null);

        // each line has the cash payment reference and then the patient name
        line[0] = row.reference;
        line[1] = row.display_name;

        // get the index of the service name and fill in the correct cell in the matrix
        const idx = data.services.indexOf(row.name) + 2;
        line[idx] = row.cashAmount;

        // get the far right row as the total
        line[xAxis + 2] = row.cumsum;
        return line;
      });

      // bind to the view
      data.matrix = matrix;

      // query the aggregates
      return db.exec(serviceAggregationSql, [dateFrom, dateTo, data.cashbox.id]);
    })
    .then((aggregates) => {
      data.aggregates = aggregates;

      // the total of everything is just the last running balance amount
      if (data.matrix) {
        const lastRow = data.matrix[data.matrix.length - 1];
        const lastRowTotalIdx = lastRow.length - 1;
        aggregates.push({ totalCashIncome : lastRow[lastRowTotalIdx] });
      }

      return serviceReport.render(data);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
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
  try {
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
  } catch (error) {
    throw error;
  }
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
