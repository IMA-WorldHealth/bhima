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
    const records = await shipment.getPackingList(uuid);
    const locations = await shipment.getShipmentLocations(uuid);
    const [single] = records;
    const step = getStep(single.status_name);

    const data = {
      step,
      single,
      records,
      locations,
      date : new Date(),
    };

    const result = await report.render(data);
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}

/**
 * @function getStep
 * @param {string} statusName
 * @desc returns the step according the shipment status
 * AT_DEPOT => Step 1
 * READY_TO_SHIP => Step 2
 * IN_TRANSIT => Step 3
 * PARTIAL => Step 4
 * DELIVERED => Step 5
 */
function getStep(statusName) {
  const definedSteps = {
    AT_DEPOT : 1,
    READY_TO_SHIP : 2,
    IN_TRANSIT : 3,
    PARTIAL : 4,
    DELIVERED : 5,
  };
  const map = {
    empty : 1,
    at_depot : 1,
    ready : 2,
    in_transit : 3,
    partial : 4,
    complete : 5,
    delivered : 5,
  };
  const current = map[statusName];
  const steps = {
    at_depot : current >= definedSteps.AT_DEPOT,
    ready : current >= definedSteps.READY_TO_SHIP,
    in_transit : current >= definedSteps.IN_TRANSIT,
    partial : current >= definedSteps.PARTIAL,
    delivered : current >= definedSteps.DELIVERED,
  };
  return steps;
}

exports.getShipmentOverview = getShipmentOverview;
