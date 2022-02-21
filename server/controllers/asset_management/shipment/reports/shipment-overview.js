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
    const single = await shipment.lookupSingle(uuid);
    const records = await shipment.getPackingList(uuid);
    const log = await shipment.getShipmentInfo(uuid);
    const step = shipment.getStep(single.status_name);

    const data = {
      step,
      single,
      records,
      log,
      date : new Date(),
    };

    const result = await report.render(data);
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}

exports.getShipmentOverview = getShipmentOverview;
