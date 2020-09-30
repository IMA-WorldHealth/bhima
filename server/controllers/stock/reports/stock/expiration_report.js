const {
  _, db, ReportManager, pdfOptions, STOCK_EXPIRATION_REPORT_TEMPLATE,
} = require('../common');

const stockCore = require('../../core');

/**
 * @method stockExpirationReport
 *
 * @description
 *
 */
async function stockExpirationReport(req, res, next) {

  try {
    const params = { includeEmptyLot : 0, ...req.query };

    const optionReport = _.extend(params, pdfOptions, {
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

    // get the lots for this depot
    const lots = await stockCore.getLotsDepot(options.depot_uuid, options);

    // get the lots that are "at risk"
    const risky = lots.filter(lot => lot.IS_IN_RISK_EXPIRATION);

    // make sure lots are grouped by depot.
    const groupedByDepot = _.groupBy(risky, 'depot_uuid');

    // grand totals
    const totals = {
      expired : { value : 0, quantity : 0 },
      at_risk : { value : 0, quantity : 0 },
    };

    const today = new Date();

    const values = _.map(groupedByDepot, (rows) => {
      let total = 0;

      rows.forEach(lot => {
        lot.value = (lot.mvt_quantity * lot.unit_cost);
        total += lot.value;

        if (lot.expiration_date < today) {
          lot.statusKey = 'STOCK.EXPIRED';
          lot.classKey = 'bg-danger text-danger';
          totals.expired.value += lot.value;
          totals.expired.quantity += lot.mvt_quantity;
        } else {
          lot.statusKey = 'STOCK.STATUS.IS_IN_RISK_OF_EXPIRATION';
          lot.classKey = 'bg-warning text-warning';
          totals.at_risk.value += lot.value;
          totals.at_risk.quantity += lot.mvt_quantity;
        }
      });

      return {
        total,
        rows,
        depot_name : rows[0].depot_text,
      };
    });

    const reportResult = await report.render({
      depot, result : values, totals,
    });

    res.set(reportResult.headers).send(reportResult.report);
  } catch (error) {
    next(error);
  }
}

module.exports = stockExpirationReport;
