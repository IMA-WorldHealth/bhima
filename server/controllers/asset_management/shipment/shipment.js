const _ = require('lodash');
const db = require('../../../lib/db');
const FilterParser = require('../../../lib/filter');
const { uuid } = require('../../../lib/util');

// NOTE: These constants must match those in bhConstants.js (shipmentStatus)
const SHIPMENT_AT_DEPOT = 2;
const SHIPMENT_READY = 3;
const SHIPMENT_IN_TRANSIT = 4;
const SHIPMENT_PARTIAL = 5;
const SHIPMENT_COMPLETE = 6;
const SHIPMENT_IN_TRANSIT_OR_PARTIAL = [SHIPMENT_IN_TRANSIT, SHIPMENT_PARTIAL];

exports.find = find;
exports.lookup = lookup;
exports.lookupSingle = lookupSingle;
exports.getShipmentInfo = getShipmentInfo;
exports.getPackingList = getPackingList;
exports.getStep = getStep;

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

exports.overview = async (req, res, next) => {
  try {
    const identifier = req.params.uuid;
    const packingList = await getPackingList(identifier);
    const locations = await getShipmentInfo(identifier);
    const [info] = packingList;
    const step = getStep(info.status_name);
    const output = {
      info,
      step,
      packingList,
      locations,
    };
    res.status(200).json(output);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const params = req.body;
    const identifier = params.uuid || uuid();
    const SHIPMENT_UUID = db.bid(identifier);
    const SHIPMENT_LABEL = params.name;
    const shipment = {
      uuid : SHIPMENT_UUID,
      name : SHIPMENT_LABEL,
      project_id : req.session.project.id,
      description : params.description,
      origin_depot_uuid : db.bid(params.origin_depot_uuid),
      destination_depot_uuid : db.bid(params.destination_depot_uuid),
      anticipated_delivery_date : new Date(params.anticipated_delivery_date),
      date_sent : null,
      status_id : SHIPMENT_AT_DEPOT,
      created_by : req.session.user.id,
      document_uuid : null,
    };

    const transaction = db.transaction();
    transaction.addQuery('INSERT INTO shipment SET ?', shipment);

    params.lots.forEach((lot) => {
      const shipmentItem = {
        uuid : db.bid(uuid()),
        shipment_uuid : SHIPMENT_UUID,
        lot_uuid : db.bid(lot.lot_uuid),
        date_packed : new Date(),
        quantity_sent : lot.quantity,
      };
      transaction.addQuery('INSERT INTO shipment_item SET ?', shipmentItem);
    });

    addTrackingLogMessage(transaction, identifier, 'SHIPMENT.SHIPMENT_CREATED', req.session.user.id);

    await transaction.execute();
    res.status(201).json({ uuid : identifier });
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
      'SELECT status_id FROM shipment WHERE uuid = ?',
      [db.bid(identifier)],
    );

    const canUpdate = shipmentStatus.status_id === SHIPMENT_AT_DEPOT;

    if (canUpdate) {
      const transaction = db.transaction();
      transaction.addQuery(
        'UPDATE shipment SET ? WHERE uuid = ? AND status_id = ?',
        [params, db.bid(identifier), SHIPMENT_AT_DEPOT],
      );

      if ((lots || []).length) {
        transaction.addQuery('DELETE FROM shipment_item WHERE shipment_uuid = ?', [db.bid(identifier)]);

        lots.forEach((lot) => {
          const shipmentItem = {
            uuid : db.bid(uuid()),
            shipment_uuid : db.bid(identifier),
            lot_uuid : db.bid(lot.lot_uuid),
            date_packed : new Date(),
            quantity_sent : lot.quantity,
          };
          transaction.addQuery('INSERT INTO shipment_item SET ?', [shipmentItem]);
        });
      }

      addTrackingLogMessage(transaction, identifier, 'SHIPMENT.PACKING_LIST_UPDATED', req.session.user.id);

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
    const sql = `UPDATE shipment SET status_id = ?, date_ready_for_shipment = ? WHERE uuid = ?;`;

    const [shipmentStatus] = await db.exec(
      'SELECT status_id FROM shipment WHERE uuid = ?',
      [db.bid(identifier)],
    );
    const inDepot = !!(shipmentStatus.status_id === SHIPMENT_AT_DEPOT);

    if (inDepot) {
      await db.exec(sql, [SHIPMENT_READY, new Date(), db.bid(identifier)]);
    } else {
      throw new Error('You cannot update a shipment which is not in AT_DEPOT status');
    }

    const transaction = db.transaction();
    addTrackingLogMessage(transaction, identifier, 'SHIPMENT.MARKED_READY_TO_SHIP', req.session.user.id);
    await transaction.execute();

    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
};

exports.setShipmentCompleted = async (req, res, next) => {
  try {
    const identifier = req.params.uuid;
    const sql = `UPDATE shipment SET status_id = ?, date_delivered = ? WHERE uuid = ?;`;

    const [shipmentStatus] = await db.exec(
      'SELECT status_id FROM shipment WHERE uuid = ?',
      [db.bid(identifier)],
    );
    const inDepot = !!(shipmentStatus.status_id === SHIPMENT_PARTIAL);

    if (inDepot) {
      await db.exec(sql, [SHIPMENT_COMPLETE, new Date(), db.bid(identifier)]);
    } else {
      throw new Error('You a shipment must be partial before it can be completed with this query');
    }

    const transaction = db.transaction();
    addTrackingLogMessage(transaction, identifier, 'SHIPMENT.PARTIAL_MARKED_COMPLETE', req.session.user.id);
    await transaction.execute();

    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
};

exports.addShipmentTrackingLogEntry = async (req, res, next) => {
  try {
    const identifier = req.params.uuid;
    const { params } = req.body;

    _.pick(params, ['note']);

    const transaction = db.transaction();
    addTrackingLogMessage(transaction, identifier, params.note, req.session.user.id);
    await transaction.execute();

    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
};

exports.deleteShipment = async (req, res, next) => {
  try {
    const identifier = req.params.uuid;
    await deleteShipment(identifier);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

exports.listShipmentInfo = async (req, res, next) => {
  try {
    const identifier = req.params.uuid;
    const rows = await getShipmentInfo(identifier);
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
  const shipmentExist = await isShipmentExists(document.shipment_uuid);

  if (shipmentExist) {
    // update the status of the shipment
    // because the shipment was already made with the shipment tool
    const updateQuery = `
      UPDATE shipment SET status_id = ?, date_sent = ?, document_uuid = ? WHERE uuid = ?
    `;
    transaction.addQuery(updateQuery, [
      SHIPMENT_IN_TRANSIT, new Date(), db.bid(document.uuid), db.bid(document.shipment_uuid),
    ]);

    addTrackingLogMessage(transaction, document.shipment_uuid, 'SHIPMENT.STOCK_EXITED_DONE', parameters.user_id);

  } else {
    // write new shipment
    const SHIPMENT_UUID = db.bid(uuid());
    const SHIPMENT_LABEL = 'Depot Exit Shipment';
    const shipment = {
      uuid : SHIPMENT_UUID,
      name : SHIPMENT_LABEL,
      project_id : projectId,
      description : parameters.description,
      origin_depot_uuid : from,
      destination_depot_uuid : to,
      anticipated_delivery_date : document.date,
      date_sent : new Date(),
      date_ready_for_shipment : document.date,
      status_id : SHIPMENT_IN_TRANSIT,
      created_by : document.user,
      document_uuid : db.bid(document.uuid),
    };
    transaction.addQuery('INSERT INTO shipment SET ?', shipment);

    parameters.lots.forEach((lot) => {
      const shipmentItem = {
        uuid : db.bid(uuid()),
        shipment_uuid : SHIPMENT_UUID,
        lot_uuid : db.bid(lot.uuid),
        date_packed : document.date,
        quantity_sent : lot.quantity,
      };
      transaction.addQuery('INSERT INTO shipment_item SET ?', shipmentItem);
    });

    addTrackingLogMessage(transaction, SHIPMENT_UUID, 'SHIPMENT.SHIPMENT_CREATED', document.user);
    addTrackingLogMessage(transaction, SHIPMENT_UUID, 'SHIPMENT.STOCK_EXITED_DONE', document.user);
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
      sh.date_delivered = ?
    WHERE sh.status_id IN (?) AND sh.document_uuid = ? AND shi.lot_uuid = ?
  `;
  parameters.lots.forEach(lot => {
    const updateParameters = [
      lot.quantity || 0,
      document.date,
      SHIPMENT_IN_TRANSIT_OR_PARTIAL,
      db.bid(document.uuid),
      db.bid(lot.uuid),
    ];
    transaction.addQuery(updateShipmentItem, updateParameters);
  });
};

exports.updateShipmentStatusAfterEntry = async (document) => {
  const tx = db.transaction();
  // gather information about shipment items received
  const queryShipmentItems = `
      SELECT
        BUID(shi.uuid) uuid, BUID(shi.lot_uuid) lot_uuid,
        sh.origin_depot_uuid, sh.destination_depot_uuid,
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

  tx.addQuery(updateShipmentStatus, [
    newStatus,
    db.bid(document.uuid),
  ]);

  // If we are doing a stock entry (not via shipments),
  // we need to find the shipment uuid
  if (!document.shipment_uuid) {
    const sql = 'SELECT BUID(uuid) AS shipment_uuid FROM shipment sh WHERE document_uuid = ?';
    const result = await db.exec(sql, [db.bid(document.uuid)]);
    if (result.length) {
      document.shipment_uuid = result[0].shipment_uuid;
    }
  }

  // Add a shipment tracking log entry for the stock entry
  const statusMsg = newStatus === SHIPMENT_COMPLETE
    ? 'SHIPMENT.STOCK_ENTRY_COMPLETE' : 'SHIPMENT.STOCK_ENTRY_PARTIAL';
  addTrackingLogMessage(tx, document.shipment_uuid, statusMsg, document.user);

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
      i.purchase_interval, i.delay, i.is_asset,
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

exports.findAffectedAssets = async (req, res, next) => {
  try {
    const params = req.query;
    const result = await findAffectedAssets(params);
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
    'destination_depot_uuid',
    'lot_uuid',
    'inventory_uuid',
    'group_uuid',
    'except_current_shipment',
  ]);

  const filters = new FilterParser(params);

  filters.equals('uuid', 'uuid', 'l');
  filters.equals('origin_depot_text', 'text', 'd');
  filters.equals('destination_depot_text', 'text', 'd2');
  filters.equals('origin_depot_uuid', 'origin_depot_uuid', 'sh');
  filters.equals('destination_depot_uuid', 'destination_depot_uuid', 'sh');
  filters.equals('lot_uuid', 'uuid', 'l');
  filters.equals('inventory_uuid', 'uuid', 'i');
  filters.equals('group_uuid', 'uuid', 'ig');
  filters.equals('text', 'text', 'i');
  filters.equals('label', 'label', 'l');
  filters.equals('reference', 'text', 'dm');
  filters.equals('is_asset', 'is_asset', 'i');

  // except current
  filters.custom(
    'except_current_shipment',
    'sh.uuid <> ?',
  );

  // at depot for real : shipment with status `at_depot` or `ready_for_shipment`
  filters.custom('currently_at_depot', 'sh.status_id IN (2, 3)');

  // status
  filters.custom('status', 'sh.status_id IN (?)');

  // barcode
  filters.custom(
    'barcode',
    `CONCAT('SHIP', LEFT(HEX(l.uuid), 8)) = ?`,
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
      BUID(sh.origin_depot_uuid) AS origin_depot_uuid,
      d.text AS origin_depot,
      BUID(sh.destination_depot_uuid) AS destination_depot_uuid,
      d2.text AS destination_depot,
      sh.name, sh.description, sh.note,
      BUID(sh.document_uuid) AS document_uuid,
      sh.created_at AS date, sh.date_sent, sh.date_delivered,
      sh.date_ready_for_shipment, sh.anticipated_delivery_date,
      sh.receiver, u.display_name AS created_by
    FROM shipment sh
    JOIN shipment_status ss ON ss.id = sh.status_id
    JOIN depot d ON d.uuid = sh.origin_depot_uuid
    JOIN depot d2 ON d2.uuid = sh.destination_depot_uuid
    JOIN document_map dm ON dm.uuid = sh.uuid
    JOIN user u ON u.id = sh.created_by
    LEFT JOIN document_map dm2 ON dm2.uuid = sh.document_uuid
  `;

  const query = filters.applyQuery(sql);
  const queryParameters = filters.parameters();
  return db.exec(query, queryParameters);
}

function findAffectedAssets(params) {
  const filters = getShipmentFilters(params);
  const sql = `
    SELECT
      BUID(shi.uuid) AS uuid, BUID(sh.uuid) AS shipment_uuid,
      BUID(shi.lot_uuid) AS lot_uuid, shi.quantity_sent,
      l.label AS lot_label, i.code AS inventory_code,
      i.text AS inventory_text, i.is_asset,
      dm.text AS reference
    FROM shipment sh
    JOIN shipment_item shi ON shi.shipment_uuid = sh.uuid
    JOIN lot l ON l.uuid = shi.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN depot d ON d.uuid = sh.origin_depot_uuid
    LEFT JOIN document_map dm ON dm.uuid = sh.uuid
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
      ss.name AS status_name,
      dm.text AS reference,
      dm2.text AS stock_reference,
      d.text AS origin_depot,
      BUID(sh.origin_depot_uuid) AS origin_depot_uuid,
      d2.text AS destination_depot,
      BUID(sh.destination_depot_uuid) AS destination_depot_uuid,
      sh.name, sh.description, sh.note,
      BUID(sh.document_uuid) AS document_uuid,
      sh.created_at AS date, sh.date_sent, sh.date_delivered,
      sh.anticipated_delivery_date, sh.date_ready_for_shipment,
      sh.receiver, u.display_name AS created_by,
      BUID(shi.lot_uuid) AS lot_uuid, shi.quantity_sent AS quantity
    FROM shipment sh
    JOIN shipment_item shi ON shi.shipment_uuid = sh.uuid
    JOIN shipment_status ss ON ss.id = sh.status_id
    JOIN depot d ON d.uuid = sh.origin_depot_uuid
    JOIN depot d2 ON d2.uuid = sh.destination_depot_uuid
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
      ss.name AS status_name,
      dm.text AS reference,
      dm2.text AS stock_reference,
      d.text AS origin_depot,
      BUID(sh.origin_depot_uuid) AS origin_depot_uuid,
      d2.text AS destination_depot,
      BUID(sh.destination_depot_uuid) AS destination_depot_uuid,
      sh.name, sh.description, sh.note,
      BUID(sh.document_uuid) AS document_uuid,
      sh.created_at AS date, sh.date_sent, sh.date_delivered,
      sh.anticipated_delivery_date, sh.date_ready_for_shipment,
      sh.receiver, u.display_name AS created_by
    FROM shipment sh
    JOIN shipment_status ss ON ss.id = sh.status_id
    JOIN depot d ON d.uuid = sh.origin_depot_uuid
    JOIN depot d2 ON d2.uuid = sh.destination_depot_uuid
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

function addTrackingLogMessage(tx, shipmentUuid, note, userId) {
  if (!shipmentUuid) {
    // In regtests we may not have the shipment uuid, so skip this
    return;
  }
  const logInfo = {
    uuid : db.bid(uuid()),
    shipment_uuid : db.bid(shipmentUuid),
    note,
    user_id : userId,
  };
  tx.addQuery('INSERT INTO shipment_tracking SET ?;', [logInfo]);
}

async function getPackingList(identifier) {
  const sql = `
    SELECT
      BUID(shi.uuid) AS uuid,
      ss.translation_key AS status,
      ss.id AS status_id,
      ss.name AS status_name,
      sh.name, sh.description, sh.note,
      BUID(sh.document_uuid) AS document_uuid,
      sh.created_at AS date, sh.date_sent, sh.date_delivered,
      sh.anticipated_delivery_date,
      sh.receiver, u.display_name AS created_by,
      shi.quantity_sent, shi.quantity_delivered, shi.date_packed,
      l.label AS lot_label, sv.wac AS unit_price,
      i.code AS inventory_code, i.text AS inventory_label, i.is_asset,
      dm.text AS reference
    FROM shipment sh
    JOIN shipment_status ss ON ss.id = sh.status_id
    JOIN shipment_item shi ON shi.shipment_uuid = sh.uuid
    JOIN lot l ON l.uuid = shi.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN stock_value sv ON sv.inventory_uuid = i.uuid
    JOIN user u ON u.id = sh.created_by
    JOIN document_map dm ON dm.uuid = sh.uuid
    WHERE sh.uuid = ?
  `;

  return db.exec(sql, [db.bid(identifier)]);
}

async function getShipmentInfo(shipmentUuid) {
  const sql = `
    SELECT BUID(s.uuid) uuid, s.date, s.note, u.display_name
    FROM shipment_tracking s
    JOIN user u ON u.id = s.user_id
    WHERE s.shipment_uuid = ?
    ORDER BY s.date ASC;
  `;

  return db.exec(sql, [db.bid(shipmentUuid)]);
}

async function deleteShipment(identifier) {
  const [shipmentStatus] = await db.exec(
    'SELECT status_id FROM shipment WHERE uuid = ?',
    [db.bid(identifier)],
  );

  const inDepot = !!(shipmentStatus.status_id === SHIPMENT_AT_DEPOT || shipmentStatus.status_id === SHIPMENT_READY);

  if (inDepot) {
    const queryDeleteItems = 'DELETE FROM shipment_item WHERE shipment_uuid = ?;';
    const queryDeleteShipment = 'DELETE FROM shipment WHERE uuid = ?;';
    const tx = db.transaction();
    tx.addQuery(queryDeleteItems, [db.bid(identifier)]);
    tx.addQuery(queryDeleteShipment, [db.bid(identifier)]);
    await tx.execute();
  } else {
    throw new Error('You cannot update it because it is not in AT_DEPOT status');
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
