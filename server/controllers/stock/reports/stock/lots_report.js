const {
  _, ReportManager, Stock, formatFilters, STOCK_LOTS_REPORT_TEMPLATE,
} = require('../common');

const i18n = require('../../../../lib/helpers/translate');

/**
 * @method stockLotsReport
 *
 * @description
 * This method builds the stock lots report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/stock/lots
 */
function stockLotsReport(req, res, next) {
  const { lang } = req.query;
  let options = {};
  let display = {};
  let filters;

  const data = {};
  let hasFilter = false;
  let report;

  const optionReport = _.extend(req.query, {
    filename : 'TREE.STOCK_LOTS',
  });

  // set up the report with report manager
  try {
    if (req.query.identifiers && req.query.display) {
      options = JSON.parse(req.query.identifiers);
      display = JSON.parse(req.query.display);
      filters = formatFilters(display);
      hasFilter = Object.keys(display).length > 0;
    } else {
      options = req.query;
    }

    report = new ReportManager(STOCK_LOTS_REPORT_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  if (options.defaultPeriod) {
    options.defaultPeriodEntry = options.defaultPeriod;
    delete options.defaultPeriod;
  }

  if (req.session.stock_settings.enable_strict_depot_permission) {
    options.check_user_id = req.session.user.id;
  }

  options.month_average_consumption = req.session.stock_settings.month_average_consumption;
  options.average_consumption_algo = req.session.stock_settings.average_consumption_algo;

  const purgeKeys = ['NO_CONSUMPTION', 'S_MONTH', 'S_RISK', 'S_RISK_QUANTITY',
    'at_risk_of_stock_out', 'cmms', 'color',
    'default_purchase_interval', 'delay', 'depot_uuid',
    'enterprisePurchaseInterval', 'exhausted', 'expired',
    'inventory_uuid', 'lifetime_lot', 'min_delay',
    'min_months_security_stock', 'mvt_quantity', 'near_expiration',
    'purchase_interval', 'tag_name', 'tracking_consumption',
    'tracking_expiration', 'wac'];

  const dateKeys = ['min_stock_date', 'max_stock_date'];

  // stock status label keys
  // WARNING: Must match stockStatusLabelKeys in client StockService
  // TODO: Move to shared constants file for client and server sides
  const stockStatusLabelKeys = {
    stock_out         : 'STOCK.STATUS.STOCK_OUT',
    in_stock          : 'STOCK.STATUS.IN_STOCK',
    security_reached  : 'STOCK.STATUS.SECURITY',
    minimum_reached   : 'STOCK.STATUS.MINIMUM',
    over_maximum      : 'STOCK.STATUS.OVER_MAX',
    unused_stock      : 'STOCK.STATUS.UNUSED_STOCK',
  };

  return Stock.getLotsDepot(null, options)
    .then((rows) => {
      // Purge unneeded fields from the row
      rows.forEach(row => {
        purgeKeys.forEach(key => {
          delete row[key];
        });
        // Sanitize invalid dates
        dateKeys.forEach(key => {
          if (JSON.stringify(row[key]) === 'null') {
            row[key] = '';
          }
        });
        // translate the status field
        if (row.status in stockStatusLabelKeys) {
          row.status = i18n(lang)(stockStatusLabelKeys[row.status]);
        }
      });

      data.rows = rows;
      data.hasFilter = hasFilter;
      data.filters = filters;
      data.csv = rows;
      data.display = display;
      data.filters = formatFilters(options);

      // group by depot
      const groupedDepots = _.groupBy(rows, d => d.depot_text);
      const depots = {};

      Object.keys(groupedDepots).sort(compare).forEach(d => {
        depots[d] = _.sortBy(groupedDepots[d], line => String(line.text).toLocaleLowerCase());
      });

      data.depots = depots;
      return report.render(data);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}

function compare(a, b) {
  return a.localeCompare(b);
}

module.exports = stockLotsReport;
