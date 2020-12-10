const {
  _, db, ReportManager, STOCK_EXPIRATION_REPORT_TEMPLATE,
} = require('../common');

const stockCore = require('../../core');

/**
 * @method stockExpirationReport
 *
 * @description
 *
 */
async function stockExpirationReport(req, res, next) {
  const today = new Date();

  try {
    const params = { includeEmptyLot : 0, ...req.query };

    const optionReport = _.extend(params, {
      filename : 'REPORT.STOCK_EXPIRATION_REPORT.TITLE',
    });

    // set up the report with report manager
    const report = new ReportManager(STOCK_EXPIRATION_REPORT_TEMPLATE, req.session, optionReport);
    const options = params;

    if (req.session.stock_settings.enable_strict_depot_permission) {
      options.check_user_id = req.session.user.id;
    }

    let depot = {};

    if (options.depot_uuid) {
      const depotSql = 'SELECT text FROM depot WHERE uuid = ?';
      depot = await db.one(depotSql, db.bid(options.depot_uuid));
    }

    // clean off the label if it exists so it doesn't mess up the PDF export
    delete options.label;

    // define month average and the algo to use
    // eslint-disable-next-line
    const { month_average_consumption, average_consumption_algo } = req.session.stock_settings;
    _.extend(options, { month_average_consumption, average_consumption_algo });

    // get the lots for this depot
    const lots = await stockCore.getLotsDepot(options.depot_uuid, options);

    // get the lots that are "at risk"
    const risky = lots.filter(lot => (lot.S_RISK < 0 && lot.lifetime > 0));

    // get expired lots
    const expired = lots.filter(lot => (lot.S_RISK <= 0 && lot.expiration_date <= today));

    // merge risky and expired
    const riskyAndExpiredLots = risky.concat(expired);

    // make sure lots are grouped by depot.
    const groupedByDepot = _.groupBy(riskyAndExpiredLots, 'depot_uuid');

    // grand totals
    const totals = {
      expired : { value : 0, quantity : 0 },
      at_risk : { value : 0, quantity : 0 },
    };

    const values = _.map(groupedByDepot, (rows) => {
      let total = 0;

      rows.forEach(lot => {
        if (lot.expiration_date < today) {
          lot.value = (lot.mvt_quantity * lot.unit_cost);
          lot.statusKey = 'STOCK.EXPIRED';
          lot.classKey = 'bg-danger text-danger';
          totals.expired.value += lot.value;
          totals.expired.quantity += lot.mvt_quantity;
          total += lot.value;
        } else {
          lot.quantity_at_risk = (lot.S_RISK_QUANTITY * -1);
          lot.value = (lot.quantity_at_risk * lot.unit_cost);
          lot.statusKey = 'STOCK.STATUS.IS_IN_RISK_OF_EXPIRATION';
          lot.classKey = 'bg-warning text-warning';
          totals.at_risk.value += lot.value;
          totals.at_risk.quantity += (lot.S_RISK_QUANTITY * -1);
          total += lot.value;
        }
      });

      return {
        total,
        rows,
        depot_name : rows[0].depot_text,
      };
    });

    const reportResult = await report.render({
      depot, result : values, totals, today,
    });

    res.set(reportResult.headers).send(reportResult.report);
  } catch (error) {
    next(error);
  }
}

module.exports = stockExpirationReport;
