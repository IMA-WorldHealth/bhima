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
  const { cashboxId } = req.query;

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
  data.cashboxId = cashboxId;

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
  db.one(cashboxDetailsSql, cashboxId)
    .then(cashbox => {
      data.cashbox = cashbox;
      return db.exec(cashflowByServiceSql, [dateFrom, dateTo, cashboxId]);
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
      return db.exec(serviceAggregationSql, [dateFrom, dateTo, cashboxId]);
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

      // get oposite lines to cashbox accounts in transactions as details
      return getDetailsIdentifiers(data.cashAccountIds, dateFrom, dateTo);
    })
    .then(rows => {
      data.detailsIdentifiers = rows.map(row => row.uuid);

      // build periods columns from calculated period
      return Fiscal.getPeriodsFromDateRange(data.dateFrom, data.dateTo);
    })
    .then(periods => {
      data.periodDates = periods.map(p => p.start_date);

      data.periods = periods.map(p => p.id);

      data.colspan = data.periods.length + 1;

      // skip period matrix if not transactions were identified
      if (data.detailsIdentifiers.length === 0) { return []; }

      // build periods string for query
      const periodParams = [];
      const periodString = data.periods.length ? data.periods.map(periodId => {
        periodParams.push(periodId, periodId);
        return `SUM(IF(source.period_id = ?, source.balance, 0)) AS "?"`;
      }).join(',') : '"NO_PERIOD" AS period';

      const query = `
        SELECT
          source.transaction_text, source.account_label, ${periodString},
          source.transaction_type, source.transaction_id, source.account_id
        FROM (
          SELECT
            a.number AS account_number, a.label AS account_label,
            SUM(gl.debit_equiv - gl.credit_equiv) AS balance,
            tt.id AS transaction_id, tt.type AS transaction_type,
            MAX(tt.text) AS transaction_text,
            gl.period_id, gl.account_id
          FROM general_ledger gl
          JOIN account a ON gl.account_id = a.id
          JOIN transaction_type tt ON gl.transaction_type_id = tt.id
          WHERE gl.uuid IN ?
          GROUP BY a.id, tt.id
        ) AS source
        GROUP BY transaction_type, account_id;
      `;
      return db.exec(query, [...periodParams, [data.detailsIdentifiers]]);
    })
    .then(rows => {
      // split incomes from expenses
      const incomes = _.chain(rows).filter({ transaction_type : 'income' }).groupBy('transaction_text').value();
      const expenses = _.chain(rows).filter({ transaction_type : 'expense' }).groupBy('transaction_text').value();
      const transfers = _.chain(rows).filter({ transaction_type : 'transfer' }).groupBy('transaction_text').value();

      const incomeTextKeys = _.keys(incomes);
      const expenseTextKeys = _.keys(expenses);
      const transferTextKeys = _.keys(transfers);

      const incomeTotalByTextKeys = aggregateTotalByTextKeys(incomes);
      const expenseTotalByTextKeys = aggregateTotalByTextKeys(expenses);
      const transferTotalByTextKeys = aggregateTotalByTextKeys(transfers);

      const incomeTotal = aggregateTotal(incomeTotalByTextKeys);
      const expenseTotal = aggregateTotal(expenseTotalByTextKeys);
      const transferTotal = aggregateTotal(transferTotalByTextKeys);
      const totalPeriodColumn = totalPeriods(incomeTotal, expenseTotal, transferTotal);

      _.extend(data, {
        incomes,
        expenses,
        transfers,
        incomeTextKeys,
        expenseTextKeys,
        incomeTotalByTextKeys,
        expenseTotalByTextKeys,
        transferTotalByTextKeys,
        incomeTotal,
        expenseTotal,
        transferTextKeys,
        transferTotal,
        totalPeriodColumn,
      });

      return serviceReport.render(data);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();

  /**
     * aggregateTotalByKeys
     *
     * this function process totals for incomes or expense by transaction type
     * @param {*} source
     * @param {*} sourceTotalByTextKeys
     */
  function aggregateTotalByTextKeys(source = {}) {
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

  function aggregateTotal(source = {}) {
    const totals = {};
    const dataset = _.values(source);
    data.periods.forEach(periodId => {
      totals[periodId] = _.sumBy(dataset, periodId);
    });
    return totals;
  }

  function totalPeriods(incomeTotal, expenseTotal, transferTotal) {
    const total = {};
    data.periods.forEach(periodId => {
      total[periodId] = incomeTotal[periodId] + expenseTotal[periodId] + transferTotal[periodId];
    });
    return total;
  }
}

/**
   * getDetailsIdentifiers
   *
   * this function returns uuids of oposites lines to given cashes in transactions as details
   * @param {array} cashboxesAccountIds - an array of account ids of cashboxes
   * @param {date} dateFrom
   * @param {date} dateTo
   */
function getDetailsIdentifiers(cashboxesAccountIds, dateFrom, dateTo) {
  const CANCELLED_VOUCHER_ID = 10;
  const ids = cashboxesAccountIds;
  const queryTransactions = `
      SELECT gl.trans_id
      FROM general_ledger gl
      WHERE gl.account_id IN ?
        AND
        (DATE(gl.trans_date) >= DATE(?) AND DATE(gl.trans_date) <= DATE(?))
        AND
        (
          gl.transaction_type_id <> ${CANCELLED_VOUCHER_ID} AND
          gl.record_uuid NOT IN (SELECT v.uuid FROM voucher v WHERE v.type_id = ${CANCELLED_VOUCHER_ID})
        );
    `;

  return db.exec(queryTransactions, [[ids], dateFrom, dateTo])
    .then(rows => {
      // skip if there is no transId
      if (rows.length === 0) { return []; }

      const transIds = rows.map(row => row.trans_id);

      const queryUuids = `
        SELECT gl.uuid
        FROM general_ledger gl
        WHERE gl.trans_id IN ? AND gl.account_id NOT IN ?;
        `;

      return db.exec(queryUuids, [[transIds], [ids]]);
    });
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
