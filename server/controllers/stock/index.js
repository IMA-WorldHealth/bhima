/**
 * @module stock/
 *
 *
 * @description
 * The /stock HTTP API endpoint
 *
 * This module is responsible for handling all crud operations relatives to stocks
 * and define all stock API functions
 * @requires lib/uuid/v4
 * @requires lib/db
 * @requires stock/core
 */

const { uuid } = require('../../lib/util');
const db = require('../../lib/db');
const core = require('./core');
const importing = require('./import');
const assign = require('./assign');
const requisition = require('./requisition/requisition');
const requestorType = require('./requisition/requestor_type');

// expose to the API
exports.createStock = createStock;
exports.createMovement = createMovement;
exports.listLots = listLots;
exports.listLotsDepot = listLotsDepot;
exports.listInventoryDepot = listInventoryDepot;
exports.listLotsMovements = listLotsMovements;
exports.listStockFlux = listStockFlux;
exports.listLotsOrigins = listLotsOrigins;
exports.createIntegration = createIntegration;
exports.importing = importing;
exports.assign = assign;
exports.requisition = requisition;
exports.requestorType = requestorType;
exports.createInventoryAdjustment = createInventoryAdjustment;

// stock consumption
exports.getStockConsumption = getStockConsumption;
exports.getStockConsumptionAverage = getStockConsumptionAverage;

// stock transfers
exports.getStockTransfers = getStockTransfers;


/**
 * POST /stock/lots
 * Create a new stock lots entry
 */
function createStock(req, res, next) {
  const params = req.body;
  const transaction = db.transaction();
  const document = {
    uuid : uuid(),
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

  params.lots.forEach((lot) => {
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
      document_uuid : db.bid(document.uuid),
      flux_id : params.flux_id,
      date : document.date,
      quantity : lot.quantity,
      unit_cost : lot.unit_cost,
      is_exit : 0,
      user_id : document.user,
      description : document.description,
    };

    // adding a lot insertion query into the transaction
    transaction.addQuery(createLotQuery, [createLotObject]);

    // adding a movement insertion query into the transaction
    transaction.addQuery(createMovementQuery, [createMovementObject]);
  });

  const isExit = 0;
  const postingParams = [db.bid(document.uuid), isExit, req.session.project.id, req.session.enterprise.currency_id];

  if (req.session.enterprise.settings.enable_auto_stock_accounting) {
    transaction.addQuery('CALL PostStockMovement(?)', [postingParams]);
  }

  // execute all operations as one transaction
  transaction.execute()
    .then(() => {
      res.status(201).json({ uuid : document.uuid });
    })
    .catch(next)
    .done();
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
    });
  });

  const postingParams = [
    db.bid(documentUuid), 0, session.project.id, session.enterprise.currency_id,
  ];

  if (session.enterprise.settings.enable_auto_stock_accounting) {
    transaction.addQuery('CALL PostStockMovement(?)', [postingParams]);
  }

  await transaction.execute();
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
 * stock inventory adjustement
 */
async function createInventoryAdjustment(req, res, next) {
  try {
    const movement = req.body;
    const { lots } = movement;

    if (!movement.depot_uuid) {
      throw new Error('No defined depot');
    }

    // selected lots identifiers
    const inventoryUuids = lots.map(l => l.inventory_uuid);

    // get list of lots with their quantities
    const allLots = await core.getLotsDepot(null, { depot_uuid : movement.depot_uuid });

    // reverse all selected inventory to have finally what the user give
    const availableLots = allLots.filter(lot => {
      return inventoryUuids.includes(lot.inventory_uuid);
    });

    // pass reverse operations
    const trx = db.transaction();

    const positiveAdjustmentUuid = uuid();
    const negativeAdjustmentUuid = uuid();
    const positiveQuantities = availableLots.filter(lot => lot.quantity > 0);
    const negativeQuantities = availableLots.filter(lot => lot.quantity < 0);

    positiveQuantities.forEach(lot => {
      const reverseMovementObject = {
        uuid : db.bid(uuid()),
        lot_uuid : db.bid(lot.uuid),
        depot_uuid : db.bid(movement.depot_uuid),
        document_uuid : db.bid(negativeAdjustmentUuid),
        quantity : lot.quantity,
        unit_cost : lot.unit_cost,
        date : new Date(movement.date),
        entity_uuid : movement.entity_uuid,
        is_exit : 1,
        flux_id : core.flux.INVENTORY_RESET,
        description : movement.description,
        user_id : req.session.user.id,
      };
      trx.addQuery('INSERT INTO stock_movement SET ?', reverseMovementObject);
    });

    negativeQuantities.forEach(lot => {
      const reverseMovementObject = {
        uuid : db.bid(uuid()),
        lot_uuid : db.bid(lot.uuid),
        depot_uuid : db.bid(movement.depot_uuid),
        document_uuid : db.bid(positiveAdjustmentUuid),
        quantity : lot.quantity,
        unit_cost : lot.unit_cost,
        date : new Date(movement.date),
        entity_uuid : movement.entity_uuid,
        is_exit : 0,
        flux_id : core.flux.INVENTORY_RESET,
        description : movement.description,
        user_id : req.session.user.id,
      };
      trx.addQuery('INSERT INTO stock_movement SET ?', reverseMovementObject);
    });

    const negativeAdjustmentParams = [
      db.bid(negativeAdjustmentUuid), 1, req.session.project.id, req.session.enterprise.currency_id,
    ];

    const positiveAdjustmentParams = [
      db.bid(positiveAdjustmentUuid), 0, req.session.project.id, req.session.enterprise.currency_id,
    ];

    if (req.session.enterprise.settings.enable_auto_stock_accounting) {
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
    const positiveLots = lots.filter(lot => lot.quantity > 0);
    movement.is_exit = 0;
    movement.flux_id = core.flux.INVENTORY_ADJUSTMENT;
    movement.lots = positiveLots;

    await normalMovement(document, movement, req.session);
    res.status(201).json(document);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /stock/movement
 * Create a new stock movement
 */
function createMovement(req, res, next) {
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

  const process = (params.from_depot && params.to_depot) ? depotMovement : normalMovement;

  process(document, params, metadata)
    .then(() => {
      res.status(201).json({ uuid : document.uuid });
    })
    .catch(next)
    .done();
}

/**
 * @function normalMovement
 * @description there are only lines for IN or OUT
 */
function normalMovement(document, params, metadata) {
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

  const projectId = metadata.project.id;
  const currencyId = metadata.enterprise.currency_id;
  const postStockParameters = [db.bid(document.uuid), parameters.is_exit, projectId, currencyId];

  if (metadata.enterprise.settings.enable_auto_stock_accounting) {
    transaction.addQuery('CALL PostStockMovement(?, ?, ?, ?);', postStockParameters);
  }

  return transaction.execute();
}

/**
 * @function depotMovement
 * @description movement between depots
 */
function depotMovement(document, params) {
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

  return transaction.execute();
}

/**
 * GET /stock/lots
 * this function helps to list lots
 */
function listLots(req, res, next) {
  const params = req.query;

  core.getLots(null, params)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
 * GET /stock/lots/movements
 * returns list of stock movements
 */
function listLotsMovements(req, res, next) {
  const params = req.query;

  core.getLotsMovements(null, params)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
 * GET /stock/lots/depots/
 * returns list of each lots in each depots with their quantities
 */
function listLotsDepot(req, res, next) {
  const params = req.query;
  params.monthAverageConsumption = req.session.enterprise.settings.month_average_consumption;

  if (params.defaultPeriod) {
    params.defaultPeriodEntry = params.defaultPeriod;
    delete params.defaultPeriod;
  }
  core.getLotsDepot(null, params)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
 * GET /stock/inventory/depots/
 * returns list of each inventory in a given depot with their quantities and CMM
 * @todo process stock alert, rupture of stock
 * @todo prevision for purchase
 */
function listInventoryDepot(req, res, next) {
  const params = req.query;
  const monthAverageConsumption = req.session.enterprise.settings.month_average_consumption;

  core.getInventoryQuantityAndConsumption(params, monthAverageConsumption)
    .then((rows) => res.status(200).json(rows))
    .catch(next)
    .done();
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
