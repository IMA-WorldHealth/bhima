const {
  ReportManager,
  shipment,
  SHIPMENT_OVERVIEW_TEMPLATE,
} = require('./common');

async function getShipmentOverview(req, res, next) {
  const { uuid } = req.params;

  try {
    const report = new ReportManager(SHIPMENT_OVERVIEW_TEMPLATE, req.session, {
      filename : 'SHIPMENT.SHIPMENTS',
      orientation : 'landscape',
    });
    const details = await shipment.details(uuid);

    const data = {
      details,
    };

    const result = await report.render(data);
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}

exports.getShipmentOverview = getShipmentOverview;
