/**
 * @module stock
 *
 *
 * @description
 * The /stock HTTP API endpoint
 *
 * This module is responsible for handling all crud operations relatives to stocks
 * and define all stock API functions
 * @requires lodash
 * @requires lib/uuid
 * @requires lib/db
 * @requires stock/core
 */
const _ = require('lodash');

const { uuid } = require('../../lib/util');
const db = require('../../lib/db');
const core = require('./core');
const importing = require('./import');
const assign = require('./assign');
const requisition = require('./requisition/requisition');
const requestorType = require('./requisition/requestor_type');
const Fiscal = require('../finance/fiscal');

// expose to the API
exports.createStock = createStock;
exports.createMovement = createMovement;
exports.listLots = listLots;
exports.listLotsDepot = listLotsDepot;
exports.listInventoryDepot = listInventoryDepot;
exports.listLotsMovements = listLotsMovements;
exports.listMovements = listMovements;
exports.listStockFlux = listStockFlux;
exports.listLotsOrigins = listLotsOrigins;
exports.createIntegration = createIntegration;
exports.importing = importing;
exports.assign = assign;
exports.requisition = requisition;
exports.requestorType = requestorType;
exports.createInventoryAdjustment = createInventoryAdjustment;

exports.listStatus = core.listStatus;
// stock consumption
exports.getStockConsumption = getStockConsumption;
exports.getStockConsumptionAverage = getStockConsumptionAverage;

// stock transfers
exports.getStockTransfers = getStockTransfers;

/**
 * POST /stock/lots
 * Create a new stock lots entry
 */
async function createStock(req, res, next) {

  try {
    const params = req.body;
    const documentUuid = uuid();

    const period = await Fiscal.lookupFiscalYearByDate(params.date);
    const periodId = period.id;
    const transaction = db.transaction();
    const document = {
      uuid : documentUuid,
      date : new Date(params.date),
      user : req.session.user.id,
      depot_uuid : params.depot_uuid,
      flux_id : params.flux_id,
      description : params.description,
    };

    // prepare lot insertion query
    const createLotQuery = 'INSERT INTO lot SET ?';

    // prepare movement insertion query
    const createMovementQuery = 'INSERT INTO stock_movement SET ?';

    params.lots.forEach(lot => {
      // parse the expiration date
      const date = new Date(lot.expiration_date);

      // the lot object to insert
      const createLotObject = {
        uuid : db.bid(uuid()),
        label : lot.label,
        initial_quantity : lot.quantity,
        quantity : lot.quantity,
        unit_cost : lot.unit_cost,
        expiration_date : date,
        inventory_uuid : db.bid(lot.inventory_uuid),
        origin_uuid : db.bid(lot.origin_uuid),
        delay : 0,
      };

      // the movement object to insert
      const createMovementObject = {
        uuid : db.bid(uuid()),
        lot_uuid : createLotObject.uuid,
        depot_uuid : db.bid(document.depot_uuid),
        document_uuid : db.bid(documentUuid),
        flux_id : params.flux_id,
        date : document.date,
        quantity : lot.quantity,
        unit_cost : lot.unit_cost,
        is_exit : 0,
        user_id : document.user,
        description : document.description,
        period_id : periodId,
      };

      if (params.entity_uuid) {
        createMovementObject.entity_uuid = db.bid(params.entity_uuid);
      }

      // adding a lot insertion query into the transaction
      transaction.addQuery(createLotQuery, [createLotObject]);

      // adding a movement insertion query into the transaction
      transaction.addQuery(createMovementQuery, [createMovementObject]);
    });

    const isExit = 0;
    const postingParams = [db.bid(documentUuid), isExit, req.session.project.id, req.session.enterprise.currency_id];

    if (req.session.stock_settings.enable_auto_stock_accounting) {
      transaction.addQuery('CALL PostStockMovement(?)', [postingParams]);
    }

    // gather inventory uuids for use later recomputing the stock quantities
    const inventoryUuids = params.lots.map(lot => lot.inventory_uuid);

    // execute all operations as one transaction
    await transaction.execute();

    // update the quantity in stock as needed
    await updateQuantityInStockAfterMovement(inventoryUuids, params.date, document.depot_uuid);

    res.status(201).json({ uuid : documentUuid });
  } catch (ex) {
    next(ex);
  }
}

/**
 * @function updateQuantityInStockAfterMovement
 *
 * @description
 * This function is called after each stock movement to ensure that the quantity in stock is updated in
 * the stock_movement_status table.  It takes in an array of inventory uuids, the date, and the depot's
 * identifier.  To reduce churn, it first filers out duplicate inventory uuids before calling the stored
 * procedure.
 */
function updateQuantityInStockAfterMovement(inventoryUuids, mvmtDate, depotUuid) {
  const txn = db.transaction();

  // makes a unique array of inventory uuids so we don't do extra calls
  const uniqueInventoryUuids = inventoryUuids
    .filter((uid, index, array) => array.lastIndexOf(uid) === index);

  // loop through the inventory uuids, queuing up them to rerun
  uniqueInventoryUuids.forEach(uid => {
    txn.addQuery(`CALL computeStockQuantity(?, ?, ?)`, [
      new Date(mvmtDate),
      db.bid(uid),
      db.bid(depotUuid),
    ]);
  });

  return txn.execute();
}

/**
 * @method insertNewStock
 * @param {object} session The session object
 * @param {object} params Request body params (req.body)
 * @param {string} originTable the name of the lot origin table
 */
async function insertNewStock(session, params, originTable = 'integration') {
  const transaction = db.transaction();
  const identifier = uuid();
  const documentUuid = uuid();

  const period = await Fiscal.lookupFiscalYearByDate(params.movement.date);
  const periodId = period.id;

  const integration = {
    uuid : db.bid(identifier),
    project_id : session.project.id,
    description : params.movement.description || originTable,
    date : new Date(params.movement.date),
  };

  const sql = `INSERT INTO ${originTable} SET ?`;

  transaction.addQuery(sql, [integration]);

  params.lots.forEach((lot) => {
    const lotUuid = uuid();

    // adding a lot insertion query into the transaction
    transaction.addQuery(`INSERT INTO lot SET ?`, {
      uuid : db.bid(lotUuid),
      label : lot.label,
      initial_quantity : lot.quantity,
      quantity : lot.quantity,
      unit_cost : lot.unit_cost,
      expiration_date : new Date(lot.expiration_date),
      inventory_uuid : db.bid(lot.inventory_uuid),
      origin_uuid : db.bid(identifier),
      delay : 0,
    });

    // adding a movement insertion query into the transaction
    transaction.addQuery(`INSERT INTO stock_movement SET ?`, {
      uuid : db.bid(uuid()),
      lot_uuid : db.bid(lotUuid),
      depot_uuid : db.bid(params.movement.depot_uuid),
      document_uuid : db.bid(documentUuid),
      flux_id : params.movement.flux_id,
      date : new Date(params.movement.date),
      quantity : lot.quantity,
      unit_cost : lot.unit_cost,
      is_exit : 0,
      user_id : params.movement.user_id,
      description : params.movement.description,
      period_id : periodId,
    });
  });

  // gather inventory uuids for use later recomputing the stock quantities
  const inventoryUuids = params.lots.map(lot => lot.inventory_uuid);

  const postingParams = [
    db.bid(documentUuid), 0, session.project.id, session.enterprise.currency_id,
  ];

  if (session.stock_settings.enable_auto_stock_accounting) {
    transaction.addQuery('CALL PostStockMovement(?)', [postingParams]);
  }

  await transaction.execute();
  // update the quantity in stock as needed
  await updateQuantityInStockAfterMovement(inventoryUuids, integration.date, params.movement.depot_uuid);
  return documentUuid;
}

/**
 * POST /stock/integration
 * create a new integration entry
 */
function createIntegration(req, res, next) {
  insertNewStock(req.session, req.body, 'integration')
    .then(documentUuid => {
      res.status(201).json({ uuid : documentUuid });
    })
    .catch(next);
}

/**
 * POST /stock/inventory_adjustment
 * Stock inventory adjustement
 */
async function createInventoryAdjustment(req, res, next) {
  try {
    const movement = req.body;

    if (!movement.depot_uuid) {
      throw new Error('No defined depot');
    }

    // only consider lots that have changed.
    const lots = movement.lots
      .filter(l => l.quantity !== l.oldQuantity);

    const period = await Fiscal.lookupFiscalYearByDate(new Date(movement.date));
    const periodId = period.id;

    // pass reverse operations
    const trx = db.transaction();

    const positiveAdjustmentUuid = uuid();
    const negativeAdjustmentUuid = uuid();

    // get all lots with positive quantities
    const positiveQuantities = lots.filter(lot => lot.oldQuantity > 0);

    // get all lots with negative quantities
    // negative quantities occurs during some extra stock exit when quantity in stock
    // is already under or equal to zero
    const negativeQuantities = lots.filter(lot => lot.oldQuantity < 0);

    positiveQuantities.forEach(lot => {
      const reverseMovementObject = {
        uuid : db.bid(uuid()),
        lot_uuid : db.bid(lot.uuid),
        depot_uuid : db.bid(movement.depot_uuid),
        document_uuid : db.bid(negativeAdjustmentUuid),
        quantity : lot.oldQuantity,
        unit_cost : lot.unit_cost,
        date : new Date(movement.date),
        entity_uuid : movement.entity_uuid,
        is_exit : 1,
        flux_id : core.flux.INVENTORY_RESET,
        description : movement.description,
        user_id : req.session.user.id,
        period_id : periodId,
      };
      trx.addQuery('INSERT INTO stock_movement SET ?', reverseMovementObject);
    });

    negativeQuantities.forEach(lot => {
      const reverseMovementObject = {
        uuid : db.bid(uuid()),
        lot_uuid : db.bid(lot.uuid),
        depot_uuid : db.bid(movement.depot_uuid),
        document_uuid : db.bid(positiveAdjustmentUuid),
        quantity : lot.oldQuantity,
        unit_cost : lot.unit_cost,
        date : new Date(movement.date),
        entity_uuid : movement.entity_uuid,
        is_exit : 0,
        flux_id : core.flux.INVENTORY_RESET,
        description : movement.description,
        user_id : req.session.user.id,
        period_id : periodId,
      };
      trx.addQuery('INSERT INTO stock_movement SET ?', reverseMovementObject);
    });

    const negativeAdjustmentParams = [
      db.bid(negativeAdjustmentUuid), 1, req.session.project.id, req.session.enterprise.currency_id,
    ];

    const positiveAdjustmentParams = [
      db.bid(positiveAdjustmentUuid), 0, req.session.project.id, req.session.enterprise.currency_id,
    ];

    if (req.session.stock_settings.enable_auto_stock_accounting) {
      if (positiveQuantities.length > 0) {
        trx.addQuery('CALL PostStockMovement(?)', [negativeAdjustmentParams]);
      }

      if (negativeQuantities.length > 0) {
        trx.addQuery('CALL PostStockMovement(?)', [positiveAdjustmentParams]);
      }
    }

    // reset all previous lots
    await trx.execute();

    // pass inventory adjustment as new movement
    const document = {
      uuid : uuid(),
      date : new Date(movement.date),
      user : req.session.user.id,
    };
    const positiveLots = lots
      .filter(lot => lot.quantity > 0)
      .map(lot => {
        delete lot.oldQuantity;
        return lot;
      });

    movement.is_exit = 0;
    movement.flux_id = core.flux.INVENTORY_ADJUSTMENT;
    movement.lots = positiveLots;
    movement.period_id = periodId;

    await normalMovement(document, movement, req.session);
    res.status(201).json(document);
  } catch (err) {
    next(err);
  }
}

/**
 * @function createMovement
 *
 * @description
 * Create a new stock movement.
 *
 * POST /stock/lots/movement
 */
async function createMovement(req, res, next) {
  const params = req.body;

  const document = {
    uuid : params.document_uuid || uuid(),
    date : new Date(params.date),
    user : req.session.user.id,
  };

  const metadata = {
    project : req.session.project,
    enterprise : req.session.enterprise,
  };

  try {
    const periodId = (await Fiscal.lookupFiscalYearByDate(params.date)).id;
    params.period_id = periodId;

    const isDepotMovement = (params.from_depot && params.to_depot);
    const stockMovementFn = isDepotMovement ? depotMovement : normalMovement;
    await stockMovementFn(document, params, metadata);

    res.status(201).json({ uuid : document.uuid });
  } catch (err) {
    next(err);
  }
}

/**
 * @function normalMovement
 * @description there are only lines for IN or OUT
 */
async function normalMovement(document, params, metadata) {
  let createMovementQuery;
  let createMovementObject;

  const transaction = db.transaction();
  const parameters = params;

  const isDistributable = !!(
    (parameters.flux_id === core.flux.TO_PATIENT || parameters.flux_id === core.flux.TO_SERVICE) && parameters.is_exit
  );

  parameters.entity_uuid = parameters.entity_uuid ? db.bid(parameters.entity_uuid) : null;
  parameters.invoice_uuid = parameters.invoice_uuid ? db.bid(parameters.invoice_uuid) : null;

  parameters.lots.forEach((lot) => {
    createMovementQuery = 'INSERT INTO stock_movement SET ?';
    createMovementObject = {
      uuid : db.bid(uuid()),
      lot_uuid : db.bid(lot.uuid),
      depot_uuid : db.bid(parameters.depot_uuid),
      document_uuid : db.bid(document.uuid),
      quantity : lot.quantity,
      unit_cost : lot.unit_cost,
      date : document.date,
      entity_uuid : parameters.entity_uuid,
      is_exit : parameters.is_exit,
      flux_id : parameters.flux_id,
      description : parameters.description,
      user_id : document.user,
      invoice_uuid : parameters.invoice_uuid,
      period_id : parameters.period_id,
    };

    // transaction - add movement
    transaction.addQuery(createMovementQuery, [createMovementObject]);

    // track distribution to patient and service
    if (isDistributable) {
      const consumptionParams = [
        db.bid(lot.inventory_uuid), db.bid(parameters.depot_uuid), document.date, lot.quantity,
      ];
      transaction.addQuery('CALL ComputeStockConsumptionByDate(?, ?, ?, ?)', consumptionParams);
    }
  });

  // gather inventory uuids for later quantity in stock calculation updates
  const inventoryUuids = parameters.lots.map(lot => lot.inventory_uuid);

  const projectId = metadata.project.id;
  const currencyId = metadata.enterprise.currency_id;
  const postStockParameters = [db.bid(document.uuid), parameters.is_exit, projectId, currencyId];

  if (metadata.enterprise.settings.enable_auto_stock_accounting) {
    transaction.addQuery('CALL PostStockMovement(?, ?, ?, ?);', postStockParameters);
  }

  const result = await transaction.execute();

  // update the quantity in stock as needed
  await updateQuantityInStockAfterMovement(inventoryUuids, document.date, parameters.depot_uuid);

  return result;
}

/**
 * @function depotMovement
 * @description movement between depots
 */
async function depotMovement(document, params) {

  let isWarehouse;
  const transaction = db.transaction();
  const parameters = params;
  const isExit = parameters.isExit ? 1 : 0;

  let record;

  parameters.entity_uuid = parameters.entity_uuid ? db.bid(parameters.entity_uuid) : null;

  const depotUuid = isExit ? db.bid(parameters.from_depot) : db.bid(parameters.to_depot);
  const entityUuid = isExit ? db.bid(parameters.to_depot) : db.bid(parameters.from_depot);
  const fluxId = isExit ? core.flux.TO_OTHER_DEPOT : core.flux.FROM_OTHER_DEPOT;

  parameters.lots.forEach((lot) => {
    record = {
      depot_uuid : depotUuid,
      entity_uuid : entityUuid,
      is_exit : isExit,
      flux_id : fluxId,
      uuid : db.bid(uuid()),
      lot_uuid : db.bid(lot.uuid),
      document_uuid : db.bid(document.uuid),
      quantity : lot.quantity,
      unit_cost : lot.unit_cost,
      date : document.date,
      description : parameters.description,
      user_id : document.user,
      period_id : parameters.period_id,
    };

    transaction.addQuery('INSERT INTO stock_movement SET ?', [record]);

    isWarehouse = !!(parameters.from_depot_is_warehouse);

    // track distribution to other depot from a warehouse
    if (record.is_exit && isWarehouse) {
      const consumptionParams = [
        db.bid(lot.inventory_uuid), db.bid(parameters.from_depot), document.date, lot.quantity,
      ];
      transaction.addQuery('CALL ComputeStockConsumptionByDate(?, ?, ?, ?)', consumptionParams);
    }
  });

  // gather inventory uuids for later quantity in stock calculation updates
  const inventoryUuids = parameters.lots.map(lot => lot.inventory_uuid);

  const result = await transaction.execute();

  // update the quantity in stock as needed
  await updateQuantityInStockAfterMovement(inventoryUuids, document.date, depotUuid);
  return result;
}

/**
 * GET /stock/lots
 * this function helps to list lots
 */
async function listLots(req, res, next) {
  const params = req.query;
  try {
    const rows = await core.getLots(null, params);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /stock/lots/movements
 * returns list of stock movements
 */
function listLotsMovements(req, res, next) {
  const params = req.query;

  if (req.session.stock_settings.enable_strict_depot_permission) {
    params.check_user_id = req.session.user.id;
  }

  core.getLotsMovements(null, params)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next);
}

/**
 * GET /stock/movements
 * returns list of stock movements
 */
function listMovements(req, res, next) {
  const params = req.query;

  if (req.session.stock_settings.enable_strict_depot_permission) {
    params.check_user_id = req.session.user.id;
  }

  core.getMovements(null, params)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next);
}

/**
 * GET /stock/lots/depots/
 * returns list of each lots in each depots with their quantities
 */
async function listLotsDepot(req, res, next) {
  const params = req.query;
  params.monthAverageConsumption = req.session.stock_settings.month_average_consumption;
  params.enableDailyConsumption = req.session.stock_settings.enable_daily_consumption;

  if (req.session.stock_settings.enable_strict_depot_permission) {
    params.check_user_id = req.session.user.id;
  }

  if (params.defaultPeriod) {
    params.defaultPeriodEntry = params.defaultPeriod;
    delete params.defaultPeriod;
  }

  try {
    const data = await core.getLotsDepot(null, params);

    const queryTags = `
      SELECT BUID(t.uuid) uuid, t.name, t.color, BUID(lt.lot_uuid) lot_uuid
      FROM tags t
        JOIN lot_tag lt ON lt.tag_uuid = t.uuid
      WHERE lt.lot_uuid IN (?)
    `;

    // if we have an empty set, do not query tags.
    if (data.length !== 0) {
      const lotUuids = data.map(row => db.bid(row.uuid));
      const tags = await db.exec(queryTags, [lotUuids]);

      // make a lot_uuid -> tags map.
      const tagMap = _.groupBy(tags, 'lot_uuid');

      data.forEach(lot => {
        lot.tags = tagMap[lot.uuid] || [];
      });
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /stock/inventory/depots/
 * returns list of each inventory in a given depot with their quantities and CMM
 * @todo process stock alert, rupture of stock
 * @todo prevision for purchase
 */
async function listInventoryDepot(req, res, next) {
  const params = req.query;
  const monthAverageConsumption = req.session.stock_settings.month_average_consumption;
  const enableDailyConsumption = req.session.stock_settings.enable_daily_consumption;

  // expose connected user data
  if (req.session.stock_settings.enable_strict_depot_permission) {
    params.check_user_id = req.session.user.id;
  }

  try {
    const inventoriesParameters = [params, monthAverageConsumption, enableDailyConsumption];

    const [inventories, lots] = await Promise.all([
      core.getInventoryQuantityAndConsumption(...inventoriesParameters),
      core.getLotsDepot(null, params),
    ]);

    for (let i = 0; i < inventories.length; i++) {
      let hasRiskyLots = false;
      let hasExpiredLots = false;
      let hasNearExpireLots = false;

      let riskyLotsQuantity = 0;
      let expiredLotsQuantity = 0;
      let nearExpireLotsQuantity = 0;

      for (let j = 0; j < lots.length; j++) {
        const hasSameDepot = lots[j].depot_uuid === inventories[i].depot_uuid;
        const hasSameInventory = lots[j].inventory_uuid === inventories[i].inventory_uuid;
        if (hasSameDepot && hasSameInventory) {
          const lot = lots[j];
          if (lot.quantity <= 0) {
            // lot exhausted
          } else if (lot.lifetime < 0) {
            // Equivalent to: lot.quantity > 0 && lot.lifetime < 0
            hasExpiredLots = true;
            expiredLotsQuantity += lot.quantity;
          } else if (lot.IS_IN_RISK_EXPIRATION) {
            // Equivalent to: lot.quantity > 0 && lot.lifetime >= 0 && lot.IS_IN_RISK_EXPIRATION
            hasNearExpireLots = true;
            nearExpireLotsQuantity += lot.quantity;
          } else if (lot.S_RISK <= 0) {
            // Equivalent to: lot.quantity > 0 && lot.lifetime >= 0 && lot.S_RISK <= 0
            hasRiskyLots = true;
            riskyLotsQuantity += lot.quantity;
          }
        }
      }

      inventories[i].hasNearExpireLots = hasNearExpireLots;
      inventories[i].hasRiskyLots = hasRiskyLots;
      inventories[i].hasExpiredLots = hasExpiredLots;

      inventories[i].nearExpireLotsQuantity = nearExpireLotsQuantity;
      inventories[i].riskyLotsQuantity = riskyLotsQuantity;
      inventories[i].expiredLotsQuantity = expiredLotsQuantity;
    }

    let rows = inventories;

    if (params.show_only_risky) {
      rows = inventories.filter(item => (item.hasRiskyLots || item.hasNearExpireLots || item.hasExpiredLots));
    }

    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /stock/lots/origins/
 * returns list of lots with their origins as reference
 */
function listLotsOrigins(req, res, next) {
  const params = req.query;
  core.getLotsOrigins(null, params)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
 * GET /stock/flux
 * returns list of stock flux
 */
function listStockFlux(req, res, next) {
  db.exec('SELECT id, label FROM flux;')
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next);
}

/**
 * GET /stock/consumptions/:periodId
 */
function getStockConsumption(req, res, next) {
  const { params } = req;
  core.getStockConsumption(params.periodId)
    .then((rows) => {
      res.status(200).send(rows);
    })
    .catch(next);
}

/**
 * GET /stock/consumptions/average/:periodId?number_of_months=...
 */
function getStockConsumptionAverage(req, res, next) {
  const { query, params } = req;
  core.getStockConsumptionAverage(params.periodId, query.number_of_months)
    .then((rows) => {
      res.status(200).send(rows);
    })
    .catch(next);
}

/**
 * GET /stock/transfer
 */
function getStockTransfers(req, res, next) {
  const params = req.query;

  // Get received transfer for the given depot
  const queryReceived = `
    SELECT
      COUNT(m.document_uuid) AS countedReceived,
      BUID(m.document_uuid) AS document_uuid,
      document_uuid AS binary_document_uuid
    FROM
      stock_movement m
    JOIN depot d ON d.uuid = m.depot_uuid
    WHERE d.uuid = ? AND m.is_exit = 0 AND m.flux_id = ${core.flux.FROM_OTHER_DEPOT}
    GROUP BY m.document_uuid
  `;

  // Get transfer for the given depot
  const query = `
    SELECT
      BUID(m.document_uuid) AS document_uuid, m.date,
      d.text AS depot_name, dd.text AS other_depot_name,
      dm.text AS document_reference,
      rx.countedReceived
    FROM
      stock_movement m
    JOIN depot d ON d.uuid = m.depot_uuid
    JOIN depot dd ON dd.uuid = m.entity_uuid
    LEFT JOIN document_map dm ON dm.uuid = m.document_uuid
    LEFT JOIN (${queryReceived}) rx ON rx.binary_document_uuid = m.document_uuid
    WHERE dd.uuid = ? AND m.is_exit = 1 AND m.flux_id = ${core.flux.TO_OTHER_DEPOT}
    GROUP BY m.document_uuid
  `;

  db.exec(query, [db.bid(params.depot_uuid), db.bid(params.depot_uuid)])
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}
