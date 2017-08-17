/**
 * @module stock/
 *
 *
 * @description
 * The /stock HTTP API endpoint
 *
 * This module is responsible for handling all crud operations relatives to stocks
 * and define all stock API functions
 * @requires lib/node-uuid
 * @requires moment
 * @requires lib/db
 * @requires stock/core
 */

const uuid = require('node-uuid');
const moment = require('moment');
const db = require('../../lib/db');
const core = require('./core');

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

// stock consumption
exports.getStockConsumption = getStockConsumption;
exports.getStockConsumptionAverage = getStockConsumptionAverage;


/**
 * POST /stock/lots
 * Create a new stock lots entry
 */
function createStock(req, res, next) {
  const params = req.body;

  let createLotQuery;
  let createLotObject;
  let createMovementQuery;
  let createMovementObject;
  let date;

  const transaction = db.transaction();

  const document = {
    uuid : uuid.v4(),
    date : new Date(params.date),
    user : req.session.user.id,
  };

  params.lots.forEach((lot) => {
        // lot expiration date
    date = new Date(lot.expiration_date);

        // lot prepare query
    createLotQuery = 'INSERT INTO lot SET ?';
    createLotObject = {
      uuid             : db.bid(uuid.v4()),
      label            : lot.label,
      initial_quantity : lot.quantity,
      quantity         : lot.quantity,
      unit_cost        : lot.unit_cost,
      expiration_date  : date,
      inventory_uuid   : db.bid(lot.inventory_uuid),
      origin_uuid      : db.bid(lot.origin_uuid),
      delay            : 0,
    };

        // entering movement prepare query
    createMovementQuery = 'INSERT INTO stock_movement SET ?';
    createMovementObject = {
      uuid          : db.bid(uuid.v4()),
      lot_uuid      : createLotObject.uuid,
      depot_uuid    : db.bid(params.depot_uuid),
      document_uuid : db.bid(document.uuid),
      flux_id       : params.flux_id,
      date          : document.date,
      quantity      : lot.quantity,
      unit_cost     : lot.unit_cost,
      is_exit       : 0,
      user_id       : document.user,
    };

        // transaction - add lot
    transaction.addQuery(createLotQuery, [createLotObject]);

        // transaction - add movement
    transaction.addQuery(createMovementQuery, [createMovementObject]);
  });

  transaction.execute()
    .then(() => {
      res.status(201).json({ uuid : document.uuid });
    })
    .catch(next)
    .done();
}

/**
 * POST /stock/movement
 * Create a new stock movement
 */
function createMovement(req, res, next) {  
  const params = req.body;
  
  const document = {
    uuid : params.document_uuid || uuid.v4(),
    date : moment(new Date(params.date)).format('YYYY-MM-DD').toString(),
    user : req.session.user.id,
  };

  const process = (params.from_depot && params.to_depot) ? depotMovement : normalMovement;

  process(document, params)
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
function normalMovement(document, params) {
  let createMovementQuery;
  let createMovementObject;
  let isDistributable;

  const transaction = db.transaction();
  const parameters = params;

  parameters.entity_uuid = parameters.entity_uuid ? db.bid(parameters.entity_uuid) : null;

  parameters.lots.forEach((lot) => {
    createMovementQuery = 'INSERT INTO stock_movement SET ?';
    createMovementObject = {
      uuid          : db.bid(uuid.v4()),
      lot_uuid      : db.bid(lot.uuid),
      depot_uuid    : db.bid(parameters.depot_uuid),
      document_uuid : db.bid(document.uuid),
      quantity      : lot.quantity,
      unit_cost     : lot.unit_cost,
      date          : document.date,
      entity_uuid   : parameters.entity_uuid,
      is_exit       : parameters.is_exit,
      flux_id       : parameters.flux_id,
      description   : parameters.description,
      user_id       : document.user,
    };

    // transaction - add movement
    transaction.addQuery(createMovementQuery, [createMovementObject]);

    isDistributable = !!(parameters.flux_id === core.flux.TO_PATIENT || parameters.flux_id === core.flux.TO_SERVICE);

    // track distribution to patient
    if (parameters.is_exit && isDistributable) {
      const consumptionParams = [
        db.bid(lot.inventory_uuid), db.bid(parameters.depot_uuid), document.date, lot.quantity,
      ];
      transaction.addQuery('CALL ComputeStockConsumptionByDate(?, ?, ?, ?)', consumptionParams);
    }
  });

  return transaction.execute();
}

/**
 * @function depotMovement
 * @description movement between depots
 */
function depotMovement(document, params) {
  let paramIn;
  let paramOut;
  let isWarehouse;
  const transaction = db.transaction();
  const parameters = params;
  const isExit = parameters.isExit;

  let record;
  
  parameters.entity_uuid = parameters.entity_uuid ? db.bid(parameters.entity_uuid) : null;

  const depot_uuid = isExit ? db.bid(parameters.from_depot) : db.bid(parameters.to_depot);
  const entity_uuid = isExit ? db.bid(parameters.to_depot) : db.bid(parameters.from_depot);
  const is_exit = isExit ? 1 : 0;
  const flux_id = isExit ? core.flux.TO_OTHER_DEPOT : core.flux.FROM_OTHER_DEPOT;

  parameters.lots.forEach((lot) => {

    record = {
      depot_uuid,
      entity_uuid,
      is_exit,
      flux_id,
      uuid          : db.bid(uuid.v4()),
      lot_uuid      : db.bid(lot.uuid),
      document_uuid : db.bid(document.uuid),
      quantity      : lot.quantity,
      unit_cost     : lot.unit_cost,
      date          : document.date,
      description   : parameters.description,
      user_id       : document.user,
    };

    transaction.addQuery('INSERT INTO stock_movement SET ?', [record]);
    
    isWarehouse = !!(parameters.from_depot_is_warehouse);

    // track distribution to patient
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

  core.getInventoryQuantityAndConsumption(params)
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
 * POST /stock/integration
 * create a new integration entry
 */
function createIntegration(req, res, next) {
  const params = req.body;
  const identifier = uuid.v4();
  const integration = {
    uuid        : db.bid(identifier),
    project_id  : req.session.project.id,
    description : params.description || 'INTEGRATION',
    date        : new Date(),
  };
  const sql = `
    INSERT INTO integration SET ?
  `;
  db.exec(sql, [integration])
  .then(() => res.status(200).json(identifier))
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
  const params = req.params;
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
  const query = req.query;
  const params = req.params;
  core.getStockConsumptionAverage(params.periodId, query.number_of_months)
    .then((rows) => {
      res.status(200).send(rows);
    })
    .catch(next);
}
