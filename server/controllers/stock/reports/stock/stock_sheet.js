const {
  db, ReportManager, Stock, STOCK_SHEET_REPORT_TEMPLATE, util,
} = require('../common');

const PeriodService = require('../../../../lib/period');

/**
 * @method stockSheetReport
 *
 * @description
 * This method builds the stock sheet report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/stock/sheet
 */
async function stockSheetReport(req, res, next) {
  const optionReport = {
    ...req.query,
    filename : 'REPORT.STOCK.INVENTORY_REPORT',
    csvKey : 'rows',
  };

  delete req.query.label;

  // set up the report with report manager
  try {
    const options = { ...util.convertStringToNumber(req.query) };

    if (options.period) {
      // compute the dateFrom and dateTo required for having opening balance
      const period = new PeriodService();
      const target = period.lookupPeriod(options.period);
      if (options.period === 'custom') {
        options.dateFrom = new Date(options.custom_period_start);
        options.dateTo = new Date(options.custom_period_end);
      } else if (options.period === 'allTime') {
        // Do not add dateFrom/dateTo so that the inventory
        // movements query below does not limit search
      } else {
        options.dateFrom = target.limit.start();
        options.dateTo = target.limit.end();
      }
      delete options.period;
    }

    const report = new ReportManager(STOCK_SHEET_REPORT_TEMPLATE, req.session, optionReport);

    const [{ rate }] = await db.exec(
      'SELECT GetExchangeRate(?, ?, NOW()) as rate;', [req.session.enterprise.id, options.currencyId],
    );

    const data = {};

    data.isEnterpriseCurrency = options.currencyId === req.session.enterprise.currency_id;
    data.exchangeRate = data.isEnterpriseCurrency ? 1 : rate;
    data.currencyId = options.currencyId;

    options.exchangeRate = data.exchangeRate;

    const [inventory, depot, rows] = await Promise.all([
      db.one('SELECT code, text FROM inventory WHERE uuid = ?;', [db.bid(options.inventory_uuid)]),
      options.depot_uuid
        ? db.one('SELECT text FROM depot WHERE uuid = ?;', [db.bid(options.depot_uuid)])
        : null,
      Stock.getInventoryMovements(options),
    ]);

    Object.assign(data, { inventory, depot });

    if (!parseInt(options.orderByCreatedAt, 10)) {
      data.rows = rows.movements.sort((x, y) => x.date - y.date);
    } else {
      // already sorted by created_at by mysql
      data.rows = rows.movements;
    }

    // mark rows if they contain negative balances
    data.rows.forEach(row => {
      row.hasNegativeValues = row.stock.quantity < 0;
    });

    const header = rows.openingBalance;
    header.hasNegativeValues = rows.openingBalance && rows.openingBalance.value < 0;

    // if this is negative, show 0 for total value
    if (header.hasNegativeValues) {
      header.value = 0;
    }

    data.totals = rows.totals;
    data.result = rows.result;
    data.header = header;
    data.dateFrom = options.dateFrom;
    data.dateTo = options.dateTo;

    const result = await report.render(data);
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}

module.exports = stockSheetReport;
