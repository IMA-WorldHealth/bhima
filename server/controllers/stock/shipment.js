const db = require('../../lib/db');
const FilterParser = require('../../lib/filter');
const { uuid } = require('../../lib/util');

const SHIPMENT_PARTIAL = 2;
const SHIPMENT_COMPLETE = 3;
const SHIPMENT_IN_TRANSIT = 4;
const SHIPMENT_IN_TRANSIT_OR_PARTIAL = [SHIPMENT_IN_TRANSIT, SHIPMENT_PARTIAL];

exports.writeStockExitShipment = (
  projectId,
  from,
  to,
  document,
  parameters,
  transaction,
) => {
  const SHIPMENT_UUID = db.bid(uuid());
  const SHIPMENT_LABEL = 'Depot Exit Shipment';
  const TRANSIT_SHIPPER = 1;
  const shipment = {
    uuid : SHIPMENT_UUID,
    name : SHIPMENT_LABEL,
    project_id : projectId,
    description : parameters.description,
    shipper_id : TRANSIT_SHIPPER,
    origin_depot_uuid : from,
    current_depot_uuid : from,
    destination_depot_uuid : to,
    anticipated_delivery_date : document.date,
    date_sent : document.date,
    status_id : SHIPMENT_IN_TRANSIT,
    created_by : document.user,
    document_uuid : db.bid(document.uuid),
  };
  transaction.addQuery('INSERT INTO shipment SET ?', [shipment]);

  parameters.lots.forEach((lot) => {
    const shipmentItem = {
      uuid : db.bid(uuid()),
      shipment_uuid : SHIPMENT_UUID,
      lot_uuid : db.bid(lot.uuid),
      date_sent : document.date,
      quantity_sent : lot.quantity,
    };
    transaction.addQuery('INSERT INTO shipment_item SET ?', [shipmentItem]);
  });
};

exports.writeStockEntryShipment = async (
  document,
  parameters,
  transaction,
) => {
  // update shipment items
  parameters.lots.forEach(lot => {
    const updateShipmentItem = `
        UPDATE shipment_item shi
        JOIN shipment sh ON sh.uuid = shi.shipment_uuid 
        SET
          shi.quantity_delivered = shi.quantity_delivered + ?,
          shi.date_delivered = ?,
          sh.date_delivered = ?
        WHERE sh.status_id IN (?) AND sh.document_uuid = ? AND shi.lot_uuid = ?
      `;
    const updateParameters = [
      lot.quantity || 0,
      document.date,
      document.date,
      SHIPMENT_IN_TRANSIT_OR_PARTIAL,
      db.bid(document.uuid),
      db.bid(lot.uuid),
    ];
    transaction.addQuery(updateShipmentItem, updateParameters);
  });
};

exports.updateShipmentStatusAfterEntry = async (document) => {
  // gather information about shipment items received
  const queryShipmentItems = `
      SELECT 
        BUID(shi.uuid) uuid, BUID(shi.lot_uuid) lot_uuid,
        shi.quantity_sent, shi.quantity_delivered
      FROM shipment sh
      JOIN shipment_item shi ON shi.shipment_uuid = sh.uuid
      WHERE sh.status_id IN (?) AND sh.document_uuid = ?
    `;
  const resultShipmentItems = await db.exec(queryShipmentItems, [
    SHIPMENT_IN_TRANSIT_OR_PARTIAL, db.bid(document.uuid),
  ]);
  const allCompleted = resultShipmentItems.every(item => {
    return item.quantity_sent === item.quantity_delivered;
  });

  // update shipment status
  const updateShipmentStatus = `
      UPDATE shipment SET status_id = ? WHERE document_uuid = ?;
    `;
  const newStatus = allCompleted ? SHIPMENT_COMPLETE : SHIPMENT_PARTIAL;
  return db.exec(updateShipmentStatus, [newStatus, db.bid(document.uuid)]);
};

exports.listInTransitInventories = async (req, res, next) => {
  try {
    const params = req.query;

    params.status = [SHIPMENT_IN_TRANSIT_OR_PARTIAL];

    const filters = getShipmentFilters(params);

    const sql = `
    SELECT 
      BUID(l.uuid) AS uuid, 
      i.code, i.text, l.label, l.description AS lot_description,
      IFNULL(SUM(shi.quantity_sent - shi.quantity_delivered), 0) AS quantity, sh.status_id AS shipment_status,
      d.text AS depot_text, d2.text AS destination,
      l.unit_cost, l.expiration_date,
      d.min_months_security_stock, d.default_purchase_interval,
      DATEDIFF(l.expiration_date, CURRENT_DATE()) AS lifetime,
      BUID(l.inventory_uuid) AS inventory_uuid,
      BUID(sh.origin_depot_uuid) AS depot_uuid,
      i.purchase_interval, i.delay,
      iu.text AS unit_type,
      ig.name AS group_name, ig.tracking_expiration, ig.tracking_consumption,
      CONCAT('LT', LEFT(HEX(l.uuid), 8)) AS barcode
    FROM shipment sh
    JOIN shipment_item shi ON shi.shipment_uuid = sh.uuid 
    JOIN shipment_status ss ON ss.id = sh.status_id 
    JOIN lot l ON l.uuid = shi.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN inventory_unit iu ON iu.id = i.unit_id
    JOIN inventory_group ig ON ig.uuid = i.group_uuid 
    JOIN depot d ON d.uuid = sh.origin_depot_uuid
    JOIN depot d2 ON d2.uuid = sh.destination_depot_uuid 
  `;

    filters.setGroup(
      'GROUP BY i.uuid, sh.origin_depot_uuid ORDER BY i.code, l.label',
    );
    const query = filters.applyQuery(sql);
    const queryParameters = filters.parameters();

    const result = await db.exec(query, queryParameters);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

function getShipmentFilters(parameters) {
  // clone the parameters
  const params = { ...parameters };

  db.convert(params, [
    'uuid',
    'origin_depot_uuid',
    'current_depot_uuid',
    'destination_depot_uuid',
    'lot_uuid',
    'inventory_uuid',
    'group_uuid',
  ]);

  const filters = new FilterParser(params);

  filters.equals('uuid', 'uuid', 'l');
  filters.equals('is_assigned', 'is_assigned', 'l');
  filters.equals('origin_depot_text', 'text', 'd');
  filters.equals('current_depot_text', 'text', 'd2');
  filters.equals('destination_depot_text', 'text', 'd3');
  filters.equals('origin_depot_uuid', 'origin_depot_uuid', 'sh');
  filters.equals('current_depot_uuid', 'current_depot_uuid', 'sh');
  filters.equals('destination_depot_uuid', 'destination_depot_uuid', 'sh');
  filters.equals('lot_uuid', 'uuid', 'l');
  filters.equals('inventory_uuid', 'uuid', 'i');
  filters.equals('group_uuid', 'uuid', 'ig');
  filters.equals('text', 'text', 'i');
  filters.equals('label', 'label', 'l');
  filters.equals('reference', 'text', 'dm');

  // status
  filters.custom('status', 'sh.status_id IN (?)');

  // barcode
  filters.custom(
    'barcode',
    `CONCAT('LT', LEFT(HEX(l.uuid), 8)) = ?`,
  );

  // is_expired is based off the server time, not off the client time.
  filters.custom(
    'is_expired',
    'IF(DATE(l.expiration_date) < DATE(NOW()), 1, 0) = ?',
  );

  filters.period('defaultPeriod', 'created_at', 'sh');
  filters.period('period', 'created_at', 'sh');

  filters.dateFrom('expiration_date_from', 'expiration_date', 'l');
  filters.dateTo('expiration_date_to', 'expiration_date', 'l');

  filters.dateFrom('entry_date_from', 'created_at', 'sh');
  filters.dateTo('entry_date_to', 'created_at', 'sh');

  filters.dateFrom('dateFrom', 'created_at', 'sh');
  filters.dateTo('dateTo', 'created_at', 'sh');

  filters.dateFrom('custom_period_start', 'created_at', 'sh');
  filters.dateTo('custom_period_end', 'created_at', 'sh');

  filters.equals('user_id', 'created_by', 'sh');

  return filters;
}
