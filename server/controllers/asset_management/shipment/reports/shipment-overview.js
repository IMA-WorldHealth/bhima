const {
  ReportManager,
  db, barcode, identifiers,
  shipment, SHIPMENT_OVERVIEW_TEMPLATE,
} = require('./common');

async function getShipmentOverview(req, res, next) {
  const { uuid } = req.params;

  try {
    const report = new ReportManager(SHIPMENT_OVERVIEW_TEMPLATE, req.session, {
      filename : 'SHIPMENT.TITLE',
      orientation : 'portrait',
    });
    const shipmentDetails = await shipment.lookupSingle(uuid);
    const records = await shipment.getPackingList(uuid);

    const depotSql = `
      SELECT
        BUID(d.uuid) as uuid, d.text, d.description, d.is_warehouse,
        BUID(d.location_uuid) AS location_uuid,
        v.name as village_name, s.name as sector_name,
        p.name as province_name, c.name as country_name
      FROM depot AS d
      LEFT JOIN village v ON v.uuid = d.location_uuid
      LEFT JOIN sector s ON s.uuid = v.sector_uuid
      LEFT JOIN province p ON p.uuid = s.province_uuid
      LEFT JOIN country c ON c.uuid = p.country_uuid
      WHERE d.uuid = ?;
    `;

    // Get the depot info
    const [originDepot] = await db.exec(depotSql, [db.bid(shipmentDetails.origin_depot_uuid)]);
    const odes = originDepot.description;
    if (typeof odes === 'string') {
      originDepot.description = odes.split('\n');
    }
    shipmentDetails.origin_depot = originDepot;

    const [destinationDepot] = await db.exec(depotSql, [db.bid(shipmentDetails.destination_depot_uuid)]);
    const ddes = destinationDepot.description;
    if (typeof ddes === 'string') {
      destinationDepot.description = ddes.split('\n');
    }
    shipmentDetails.destination_depot = destinationDepot;

    // Compute totals
    records.forEach(row => {
      row.cost = row.quantity_sent * row.unit_price;
      row.weight = row.quantity_sent * row.unit_weight;
    });
    shipmentDetails.totalCost = records.reduce((agg, row) => agg + row.cost, 0);
    shipmentDetails.totalQuantity = records.reduce((agg, row) => agg + row.quantity_sent, 0);
    shipmentDetails.totalWeight = records.reduce((agg, row) => agg + row.weight, 0);

    shipmentDetails.barcode = barcode.generate(identifiers.SHIPMENT.key, shipmentDetails.uuid);

    const data = {
      shipment : shipmentDetails,
      records,
      date : new Date(),
    };

    const result = await report.render(data);
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}

exports.getShipmentOverview = getShipmentOverview;
