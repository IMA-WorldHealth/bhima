const _ = require('lodash');
const db = require('../../../lib/db');
const FilterParser = require('../../../lib/filter');
const { uuid } = require('../../../lib/util');

const SHIPMENT_AT_DEPOT = 2;
const SHIPMENT_READY = 3;
const SHIPMENT_IN_TRANSIT = 4;
const SHIPMENT_PARTIAL = 5;
const SHIPMENT_COMPLETE = 6;
const SHIPMENT_IN_TRANSIT_OR_PARTIAL = [SHIPMENT_IN_TRANSIT, SHIPMENT_PARTIAL];

exports.find = find;
exports.lookup = lookup;
exports.getShipmentLocations = getShipmentLocations;

exports.list = async (req, res, next) => {
  try {
    const result = await find(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.single = async (req, res, next) => {
  try {
    const result = await lookupSingle(req.params.uuid);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.details = async (req, res, next) => {
  try {
    const result = await lookup(req.params.uuid);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const params = req.body;
    const SHIPMENT_UUID = db.bid(uuid());
    const SHIPMENT_LABEL = params.name;
    const TRANSIT_SHIPPER = 1; // NEED FIX: MUST BE THE SHIPPER ID
    const shipment = {
      uuid : SHIPMENT_UUID,
      name : SHIPMENT_LABEL,
      project_id : req.session.project.id,
      description : params.description,
      shipper_id : TRANSIT_SHIPPER,
      origin_depot_uuid : db.bid(params.origin_depot_uuid),
      current_depot_uuid : null,
      destination_depot_uuid : db.bid(params.destination_depot_uuid),
      anticipated_delivery_date : new Date(params.anticipated_delivery_date),
      date_sent : null,
      status_id : SHIPMENT_AT_DEPOT,
      created_by : req.session.user.id,
      document_uuid : null,
    };

    const transaction = db.transaction();
    transaction.addQuery('INSERT INTO shipment SET ?', [shipment]);

    params.lots.forEach((lot) => {
      const shipmentItem = {
        uuid : db.bid(uuid()),
        shipment_uuid : SHIPMENT_UUID,
        lot_uuid : db.bid(lot.lot_uuid),
        date_packed : new Date(),
        quantity_sent : lot.quantity,
        condition_id : lot.condition_id,
      };
      transaction.addQuery('INSERT INTO shipment_item SET ?', [shipmentItem]);
    });

    await transaction.execute();
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const identifier = req.params.uuid;
    const params = req.body;

    if (params.uuid) {
      delete params.uuid;
    }

    db.convert(params, [
      'uuid',
      'origin_depot_uuid',
      'current_depot_uuid',
      'destination_depot_uuid',
      'document_uuid',
    ]);

    db.convertDate(params, [
      'date',
      'date_sent',
      'date_delivered',
      'anticipated_delivery_date',
    ]);

    const { lots } = params;
    delete params.lots;

    const [shipmentStatus] = await db.exec(
      'SELECT status_id, ready_for_shipment FROM shipment WHERE uuid = ?',
      [db.bid(identifier)],
    );

    const canUpdate = shipmentStatus.status_id === SHIPMENT_AT_DEPOT;

    if (canUpdate) {
      const transaction = db.transaction();
      transaction.addQuery(
        'UPDATE shipment SET ? WHERE uuid = ? AND status_id = ?',
        [params, db.bid(identifier), SHIPMENT_AT_DEPOT],
      );
      transaction.addQuery('DELETE FROM shipment_item WHERE shipment_uuid = ?', [db.bid(identifier)]);

      lots.forEach((lot) => {
        const shipmentItem = {
          uuid : db.bid(uuid()),
          shipment_uuid : db.bid(identifier),
          lot_uuid : db.bid(lot.lot_uuid),
          date_packed : new Date(),
          quantity_sent : lot.quantity,
          condition_id : lot.condition_id,
        };
        transaction.addQuery('INSERT INTO shipment_item SET ?', [shipmentItem]);
      });
      await transaction.execute();
    } else {
      throw new Error('This shipment is already ready to go, you cannot update it');
    }
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
};

exports.setReadyForShipment = async (req, res, next) => {
  try {
    const identifier = req.params.uuid;
    const params = req.body;
    params.status_id = SHIPMENT_READY;
    await updateStatus(identifier, params);
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
};

exports.updateLocation = async (req, res, next) => {
  try {
    const identifier = req.params.uuid;
    const { params } = req.body;

    _.pick(params, ['current_depot_uuid']);

    const [shipmentStatus] = await db.exec(
      'SELECT status_id FROM shipment WHERE uuid = ?',
      [db.bid(identifier)],
    );

    const canUpdate = shipmentStatus.status_id === SHIPMENT_IN_TRANSIT;

    if (canUpdate) {
      // the update consit of adding new entry in the shipment location table
      const transaction = db.transaction();
      const bIdentifier = db.bid(identifier);
      const bCurrentDepotUuid = db.bid(params.current_depot_uuid);
      const newShipmentLocation = {
        uuid : db.bid(uuid()),
        shipment_uuid : bIdentifier,
        location_uuid : bCurrentDepotUuid,
        user_id : req.session.user.id,
      };
      transaction.addQuery(
        'UPDATE shipment SET current_depot_uuid = ? WHERE uuid = ?;', [bCurrentDepotUuid, bIdentifier],
      );
      transaction.addQuery('INSERT INTO shipment_location SET ?;', [newShipmentLocation]);
      await transaction.execute();
    } else {
      throw new Error('You cannot update it');
    }
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
};

exports.listShipmentLocation = async (req, res, next) => {
  try {
    const identifier = req.params.uuid;
    const rows = await getShipmentLocations(identifier);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

exports.writeStockExitShipment = async (
  projectId,
  from,
  to,
  document,
  parameters,
  transaction,
) => {
  // shipment_uuid must be sent on exit for shipment (NEW TOOL)
  const shipmentExist = await isShipmentExists(document.shipment_uuid);

  if (shipmentExist) {
    // update the status of the shipment
    // because the shipment was already made with the shipment tool
    const updateQuery = 'UPDATE shipment SET status_id = ?';
    transaction.addQuery(updateQuery, [SHIPMENT_IN_TRANSIT]);
  } else {
    // write new shipment
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
      current_depot_uuid : null,
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
  }
};

exports.writeStockEntryShipment = (
  document,
  parameters,
  transaction,
) => {
  // update shipment items
  const updateShipmentItem = `
    UPDATE shipment_item shi
    JOIN shipment sh ON sh.uuid = shi.shipment_uuid 
    SET
      shi.quantity_delivered = shi.quantity_delivered + ?,
      shi.date_delivered = ?,
      sh.date_delivered = ?
    WHERE sh.status_id IN (?) AND sh.document_uuid = ? AND shi.lot_uuid = ?
  `;
  parameters.lots.forEach(lot => {
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

exports.updateShipmentStatusAfterEntry = async (document, depotUuid) => {
  const tx = db.transaction();
  // gather information about shipment items received
  const queryShipmentItems = `
      SELECT 
        BUID(shi.uuid) uuid, BUID(shi.lot_uuid) lot_uuid,
        sh.origin_depot_uuid, sh.current_depot_uuid, sh.destination_depot_uuid,
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
      UPDATE shipment SET status_id = ?, current_depot_uuid WHERE document_uuid = ?;
    `;
  const newStatus = allCompleted ? SHIPMENT_COMPLETE : SHIPMENT_PARTIAL;

  tx.addQuery(updateShipmentStatus, [
    newStatus,
    depotUuid,
    db.bid(document.uuid),
  ]);
  return tx.execute();
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

  if (params.ready_to_ship) {
    params.ready_to_ship = parseInt(params.ready_to_ship, 10);
  }

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
  filters.equals('ready_for_shipment', 'ready_for_shipment', 'sh');

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

function find(params) {
  const filters = getShipmentFilters(params);
  const sql = `
    SELECT 
      BUID(sh.uuid) AS uuid, 
      ss.translation_key AS status,
      ss.id AS status_id,
      dm.text AS reference,
      dm2.text AS stock_reference,
      d.text AS origin_depot,
      d2.text AS current_depot,
      d3.text AS destination_depot,
      shp.name AS shipper, sh.name, sh.description, sh.note, 
      sh.created_at AS date, sh.date_sent, sh.date_delivered,
      sh.anticipated_delivery_date, 
      sh.receiver, u.display_name AS created_by
    FROM shipment sh
    JOIN shipment_status ss ON ss.id = sh.status_id 
    JOIN shipper shp ON shp.id = sh.shipper_id
    JOIN depot d ON d.uuid = sh.origin_depot_uuid
    LEFT JOIN depot d2 ON d2.uuid = sh.current_depot_uuid 
    JOIN depot d3 ON d3.uuid = sh.destination_depot_uuid 
    JOIN document_map dm ON dm.uuid = sh.uuid
    JOIN user u ON u.id = sh.created_by
    LEFT JOIN document_map dm2 ON dm2.uuid = sh.document_uuid 
  `;

  const query = filters.applyQuery(sql);
  const queryParameters = filters.parameters();
  return db.exec(query, queryParameters);
}

async function lookup(identifier) {
  const sql = `
    SELECT 
      BUID(sh.uuid) AS uuid, 
      ss.translation_key AS status,
      ss.id AS status_id,
      dm.text AS reference,
      dm2.text AS stock_reference,
      d.text AS origin_depot,
      BUID(d.uuid) AS origin_depot_uuid,
      d2.text AS destination_depot,
      BUID(d2.uuid) AS destination_depot_uuid,
      d3.name AS current_depot,
      BUID(d3.uuid) AS current_depot_uuid,
      shp.name AS shipper, shp.id AS shipper_id,
      sh.name, sh.description, sh.note, 
      sh.created_at AS date, sh.date_sent, sh.date_delivered,
      sh.anticipated_delivery_date,
      sh.receiver, u.display_name AS created_by,
      BUID(shi.lot_uuid) AS lot_uuid, shi.quantity_sent AS quantity, shi.condition_id
    FROM shipment sh
    JOIN shipment_item shi ON shi.shipment_uuid = sh.uuid
    JOIN shipment_status ss ON ss.id = sh.status_id 
    JOIN depot d ON d.uuid = sh.origin_depot_uuid
    JOIN depot d2 ON d2.uuid = sh.destination_depot_uuid 
    LEFT JOIN shipper shp ON shp.id = sh.shipper_id
    LEFT JOIN location d3 ON d3.uuid = sh.current_depot_uuid 
    JOIN document_map dm ON dm.uuid = sh.uuid
    JOIN user u ON u.id = sh.created_by
    LEFT JOIN document_map dm2 ON dm2.uuid = sh.document_uuid 
    WHERE sh.uuid = ?
  `;

  const result = await db.exec(sql, [db.bid(identifier)]);
  const [shipment] = result;
  shipment.lots = result.map(item => {
    return {
      lot_uuid : item.lot_uuid,
      quantity : item.quantity,
      condition_id : item.condition_id,
    };
  });
  return shipment;
}

async function lookupSingle(identifier) {
  const sql = `
    SELECT 
      BUID(sh.uuid) AS uuid, 
      ss.translation_key AS status,
      ss.id AS status_id,
      dm.text AS reference,
      dm2.text AS stock_reference,
      d.text AS origin_depot,
      BUID(d.uuid) AS origin_depot_uuid,
      d2.text AS destination_depot,
      BUID(d2.uuid) AS destination_depot_uuid,
      d3.name AS current_depot,
      BUID(d3.uuid) AS current_depot_uuid,
      shp.name AS shipper, shp.id AS shipper_id,
      sh.name, sh.description, sh.note, 
      sh.created_at AS date, sh.date_sent, sh.date_delivered,
      sh.anticipated_delivery_date,
      sh.receiver, u.display_name AS created_by
    FROM shipment sh
    JOIN shipment_status ss ON ss.id = sh.status_id 
    JOIN depot d ON d.uuid = sh.origin_depot_uuid
    JOIN depot d2 ON d2.uuid = sh.destination_depot_uuid 
    LEFT JOIN shipper shp ON shp.id = sh.shipper_id
    LEFT JOIN location d3 ON d3.uuid = sh.current_depot_uuid 
    JOIN document_map dm ON dm.uuid = sh.uuid
    JOIN user u ON u.id = sh.created_by
    LEFT JOIN document_map dm2 ON dm2.uuid = sh.document_uuid 
    WHERE sh.uuid = ?
  `;

  return db.one(sql, [db.bid(identifier)]);
}

async function isShipmentExists(shipmentUuid) {
  if (!shipmentUuid) { return false; }

  const sql = `SELECT uuid FROM shipment WHERE uuid = ?`;
  const [result] = await db.exec(sql, [db.bid(shipmentUuid)]);
  return !!result;
}

async function getShipmentLocations(shipmentUuid) {
  const sql = `
    SELECT l.name, sl.date, u.display_name
    FROM shipment_location sl
    JOIN location l ON l.uuid = sl.location_uuid
    JOIN user u ON u.id = sl.user_id
    WHERE sl.shipment_uuid = ?
    ORDER BY sl.date ASC;
  `;

  return db.exec(sql, [db.bid(shipmentUuid)]);
}

async function updateStatus(identifier, params) {
  _.pick(params, ['status_id']);

  const [shipmentStatus] = await db.exec(
    'SELECT status_id FROM shipment WHERE uuid = ?',
    [db.bid(identifier)],
  );

  const inDepot = !!(shipmentStatus.status_id === SHIPMENT_AT_DEPOT);
  const isReady = !!(shipmentStatus.status_id === SHIPMENT_READY);
  const canUpdate = inDepot || isReady;

  if (canUpdate) {
    const transaction = db.transaction();
    transaction.addQuery(
      'UPDATE shipment SET ? WHERE uuid = ? AND status_id IN (?)',
      [params, db.bid(identifier), [SHIPMENT_AT_DEPOT, SHIPMENT_READY]],
    );
    await transaction.execute();
  } else {
    throw new Error('You cannot update it');
  }
}
