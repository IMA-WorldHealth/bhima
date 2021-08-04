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
const moment = require('moment');

const { uuid } = require('../../lib/util');
const db = require('../../lib/db');
const { BadRequest, Unauthorized } = require('../../lib/errors');
const { DELETE_STOCK_MOVEMENT } = require('../../config/constants').actions;

const core = require('./core');
const importing = require('./import');
const assign = require('./assign');
const requisition = require('./requisition/requisition');
const requestorType = require('./requisition/requestor_type');
const Fiscal = require('../finance/fiscal');
const vouchers = require('../finance/vouchers');

// expose to the API
exports.createStock = createStock;
exports.createMovement = createMovement;
exports.deleteMovement = deleteMovement;
exports.listLots = listLots;
exports.listLotsDepot = listLotsDepot;
exports.listLotsDepotDetailed = listLotsDepotDetailed;
exports.listInventoryDepot = listInventoryDepot;
exports.listLotsMovements = listLotsMovements;
exports.listMovements = listMovements;
exports.listStockFlux = listStockFlux;
exports.createIntegration = createIntegration;
exports.importing = importing;
exports.assign = assign;
exports.requisition = requisition;
exports.requestorType = requestorType;
exports.createInventoryAdjustment = createInventoryAdjustment;
exports.createAggregatedConsumption = createAggregatedConsumption;

exports.listStatus = core.listStatus;
// stock consumption
exports.getStockConsumption = getStockConsumption;
exports.getStockConsumptionAverage = getStockConsumptionAverage;

// stock transfers
exports.getStockTransfers = getStockTransfers;

// stock dashboard
exports.dashboard = dashboard;

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

      let lotUuid = lot.uuid;

      if (lotUuid === null || typeof lotUuid === 'undefined') {
        // Create new lot (if one it does not already exist)
        lotUuid = uuid();

        // parse the expiration date
        const date = new Date(lot.expiration_date);

        // the lot object to insert
        const createLotObject = {
          uuid : db.bid(lotUuid),
          label : lot.label,
          quantity : lot.quantity,
          unit_cost : lot.unit_cost,
          expiration_date : date,
          inventory_uuid : db.bid(lot.inventory_uuid),
        };

        // adding a lot insertion query into the transaction
        transaction.addQuery(createLotQuery, [createLotObject]);
      }

      // the movement object to insert
      const createMovementObject = {
        uuid : db.bid(uuid()),
        lot_uuid : db.bid(lotUuid),
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

      // adding a movement insertion query into the transaction
      transaction.addQuery(createMovementQuery, [createMovementObject]);
    });

    const isExit = 0;
    const postingParams = [db.bid(documentUuid), isExit, req.session.project.id];

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
    txn.addQuery(`CALL StageInventoryForAMC(?)`, [db.bid(uid)]);
  });

  txn.addQuery(`CALL ComputeStockStatusForStagedInventory(DATE(?), ?)`, [
    new Date(mvmtDate),
    db.bid(depotUuid),
  ]);

  return txn.execute();
}

/**
 * @method insertNewStock
 * @param {object} session The session object
 * @param {object} params Request body params (req.body)
 */
async function insertNewStock(session, params) {
  const transaction = db.transaction();
  const documentUuid = uuid();

  const period = await Fiscal.lookupFiscalYearByDate(params.movement.date);
  const periodId = period.id;

  params.lots.forEach((lot) => {
    let lotUuid = lot.uuid;

    if (lotUuid === null) {
      // adding a lot insertion query into the transaction
      // (this is necessary only if we are creating a new lot)
      lotUuid = uuid();
      transaction.addQuery(`INSERT INTO lot SET ?`, {
        uuid : db.bid(lotUuid),
        label : lot.label,
        quantity : lot.quantity,
        unit_cost : lot.unit_cost,
        expiration_date : new Date(lot.expiration_date),
        inventory_uuid : db.bid(lot.inventory_uuid),
      });
    }

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
    db.bid(documentUuid), 0, session.project.id,
  ];

  if (session.stock_settings.enable_auto_stock_accounting) {
    transaction.addQuery('CALL PostStockMovement(?)', [postingParams]);
  }

  await transaction.execute();
  // update the quantity in stock as needed
  await updateQuantityInStockAfterMovement(inventoryUuids, params.movement.date, params.movement.depot_uuid);
  return documentUuid;
}

/**
 * POST /stock/integration
 * create a new integration entry
 */
function createIntegration(req, res, next) {
  insertNewStock(req.session, req.body)
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
    let filteredInvalidData = [];

    const paramsStock = {
      dateTo : new Date(),
      depot_uuid : movement.depot_uuid,
      includeEmptyLot : 0,
      month_average_consumption : req.session.stock_settings.month_average_consumption,
      average_consumption_algo : req.session.stock_settings.average_consumption_algo,
    };

    const stockAvailable = await core.getLotsDepot(null, paramsStock);

    if (!movement.depot_uuid) {
      throw new Error('No defined depot');
    }

    // only consider lots that have changed.
    const lots = movement.lots
      .filter(l => l.quantity !== l.oldQuantity);

    const period = await Fiscal.lookupFiscalYearByDate(new Date(movement.date));
    const periodId = period.id;

    const trx = db.transaction();
    const uniqueAdjustmentUuid = uuid();

    let countNeedIncrease = 0;
    let countNeedDecrease = 0;

    lots.forEach(lot => {
      lot.quantityAvailable = 0;

      if (lot.oldQuantity > lot.quantity) {
        lot.isExit = 1;
        lot.outputQuantity = lot.oldQuantity - lot.quantity;

        if (stockAvailable) {
          stockAvailable.forEach(stock => {
            if (stock.uuid === lot.uuid) {
              lot.quantityAvailable = stock.quantity;
            }
          });
        }
      }
    });

    filteredInvalidData = await lots.filter(l => l.outputQuantity > l.quantityAvailable);

    if (filteredInvalidData.length) {
      throw new BadRequest(
        `This stock adjustement will overconsume the quantity in stock and generate negative quantity in stock`,
        `ERRORS.ER_PREVENT_NEGATIVE_QUANTITY_IN_ADJUSTMENT_STOCK`,
      );
    }

    lots.forEach(lot => {
      const difference = lot.quantity - lot.oldQuantity;

      const adjustmentMovement = {
        uuid : db.bid(uuid()),
        lot_uuid : db.bid(lot.uuid),
        depot_uuid : db.bid(movement.depot_uuid),
        document_uuid : db.bid(uniqueAdjustmentUuid),
        quantity : Math.abs(difference),
        unit_cost : lot.unit_cost,
        date : new Date(movement.date),
        entity_uuid : movement.entity_uuid,
        flux_id : core.flux.INVENTORY_ADJUSTMENT,
        description : movement.description,
        user_id : req.session.user.id,
        period_id : periodId,
      };

      const log = {
        movement_uuid : adjustmentMovement.uuid,
        old_quantity : lot.oldQuantity,
        new_quantity : lot.quantity,
      };

      if (difference < 0) {
        // we have to do a stock exit movement
        // we must substract the |difference| to the current quantity
        countNeedDecrease++;
        adjustmentMovement.is_exit = 1;
      } else {
        // we must do increase the current quantity by the |difference|
        countNeedIncrease++;
        adjustmentMovement.is_exit = 0;
      }

      trx.addQuery('INSERT INTO stock_movement SET ?', adjustmentMovement);
      trx.addQuery('INSERT INTO stock_adjustment_log SET ?', log);
    });

    const decreaseParams = [
      db.bid(uniqueAdjustmentUuid), 1, req.session.project.id,
    ];

    const increaseParams = [
      db.bid(uniqueAdjustmentUuid), 0, req.session.project.id,
    ];

    if (req.session.stock_settings.enable_auto_stock_accounting) {
      if (countNeedDecrease > 0) {
        trx.addQuery('CALL PostStockMovement(?)', [decreaseParams]);
      }

      if (countNeedIncrease > 0) {
        trx.addQuery('CALL PostStockMovement(?)', [increaseParams]);
      }
    }

    // reset all previous lots
    await trx.execute();

    // await normalMovement(document, movement, req.session);
    res.status(201).json({ uuid : uniqueAdjustmentUuid, date : new Date(movement.date), user : req.session.user.id });
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
  let stockAvailable = [];
  let filteredInvalidData = [];

  const document = {
    uuid : params.document_uuid || uuid(),
    date : new Date(params.date),
    user : req.session.user.id,
  };

  const metadata = {
    project : req.session.project,
    enterprise : req.session.enterprise,
    stock_settings : req.session.stock_settings,
  };

  params.month_average_consumption = req.session.stock_settings.month_average_consumption;
  params.average_consumption_algo = req.session.stock_settings.average_consumption_algo;

  const paramsStock = {
    dateTo : new Date(),
    depot_uuid : params.depot_uuid,
    includeEmptyLot : 0,
    month_average_consumption : params.month_average_consumption,
    average_consumption_algo : params.average_consumption_algo,
  };

  if (params.is_exit) {
    stockAvailable = await core.getLotsDepot(null, paramsStock);

    params.lots.forEach(lot => {
      lot.quantityAvailable = 0;
      if (stockAvailable) {
        stockAvailable.forEach(stock => {
          if (stock.uuid === lot.uuid) {
            lot.quantityAvailable = stock.quantity;
          }
        });
      }
    });

    filteredInvalidData = await params.lots.filter(l => l.quantity > l.quantityAvailable);
  }

  try {
    if (filteredInvalidData.length) {
      throw new BadRequest(
        `This stock exit will overconsume the quantity in stock and generate negative quantity in stock`,
        `ERRORS.ER_PREVENT_NEGATIVE_QUANTITY_IN_EXIT_STOCK`,
      );
    }

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
 * @method deleteMovement
 * @desc perform a stock movement deletion based on its document uuid
 */
async function deleteMovement(req, res, next) {
  const tx = db.transaction();
  const identifier = db.bid(req.params.document_uuid);
  const stockSettings = req.session.stock_settings;

  // delete stock movement.
  const isUserAuthorized = req.session.actions.includes(DELETE_STOCK_MOVEMENT);

  try {

    if (!isUserAuthorized) {
      throw new Unauthorized(`User ${req.session.user.username} is not authorized to delete stock movements.`);
    }

    // movement details for future quantity update
    const movementDetailsQuery = `
      SELECT DISTINCT BUID(m.depot_uuid) AS depot_uuid, BUID(l.inventory_uuid) AS inventory_uuid,
        m.is_exit, m.date
      FROM stock_movement m
        JOIN lot l ON l.uuid = m.lot_uuid
      WHERE m.document_uuid = ?
    `;

    const movementDetails = await db.exec(movementDetailsQuery, [identifier]);

    // delete the movement(s)
    const movementDeletionQuery = `
      DELETE FROM stock_movement WHERE document_uuid = ?;
    `;

    tx.addQuery(movementDeletionQuery, [identifier]);

    const oldestDate = Math.min(...movementDetails.map(m => m.date));

    // delete lots from (purchase, donation and integration)
    const deleteLots = `
      DELETE FROM lot WHERE uuid IN (
        SELECT uuid FROM stock_movement WHERE document_uuid = ? AND flux_id IN (1, 6, 13)
      );
    `;

    tx.addQuery(deleteLots, [identifier]);

    // remove stock movements and related lots
    // by removing stock movements, only quantities are affected
    // accounting amounts are not touched in the next line
    await tx.execute();

    if (stockSettings.enable_auto_stock_accounting) {
      // find transaction's record_uuid from journal
      // safely delete voucher related to record_uuid found
      const findTransactionInJournal = `
        SELECT DISTINCT record_uuid FROM posting_journal WHERE reference_uuid = ?
      `;
      const records = await db.exec(findTransactionInJournal, [identifier]);
      const dbPromise = records.map(item => vouchers.safelyDeleteVoucher(item.record_uuid));
      await Promise.all(dbPromise);
    }

    // update the quantity of inventories
    const inventoriesByDepots = _.groupBy(movementDetails, 'depot_uuid');
    const inventoriesToUpdates = Object.keys(inventoriesByDepots).map(depot => {
      const inventories = inventoriesByDepots[depot].map(item => item.inventory_uuid);
      return updateQuantityInStockAfterMovement(inventories, new Date(oldestDate), depot);
    });

    await Promise.all(inventoriesToUpdates);

    res.sendStatus(204);
  } catch (error) {
    next(error);
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
  });

  // gather inventory uuids for later quantity in stock calculation updates
  const inventoryUuids = parameters.lots.map(lot => lot.inventory_uuid);

  const postStockParameters = [db.bid(document.uuid), parameters.is_exit, metadata.project.id];

  if (metadata.stock_settings.enable_auto_stock_accounting) {
    transaction.addQuery('CALL PostStockMovement(?, ?, ?);', postStockParameters);
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
  const transaction = db.transaction();
  const parameters = params;
  const isExit = parameters.isExit ? 1 : 0;

  let record;

  parameters.entity_uuid = parameters.entity_uuid ? db.bid(parameters.entity_uuid) : null;

  parameters.stock_requisition_uuid = parameters.stock_requisition_uuid
    ? db.bid(parameters.stock_requisition_uuid) : null;

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
      stock_requisition_uuid : parameters.stock_requisition_uuid,
    };

    transaction.addQuery('INSERT INTO stock_movement SET ?', [record]);
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
 * GET /stock/dashboard
 * returns data for stock dashboard
 */
function dashboard(req, res, next) {
  // eslint-disable-next-line
  const { month_average_consumption, average_consumption_algo, min_delay, enable_expired_stock_out } = req.session.stock_settings;

  const dbPromises = [];
  let depotsByUser = [];

  const { status } = req.query;

  const getDepotsByUser = `
    SELECT BUID(p.depot_uuid) AS depot_uuid, d.text AS depot_text
    FROM depot_permission p
      JOIN depot AS d
      ON d.uuid = p.depot_uuid
    WHERE p.user_id = ?
    ORDER BY d.text ASC`;

  db.exec(getDepotsByUser, [req.session.user.id])
    .then((depots) => {
      depotsByUser = depots;

      depots.forEach(depot => {
        if (status === 'expired') {
          const paramsFilter = {
            dateTo : new Date(),
            depot_uuid : depot.depot_uuid,
            includeEmptyLot : 0,
            is_expired : 1,
          };

          dbPromises.push(core.getInventoryQuantityAndConsumption(
            paramsFilter,
            month_average_consumption,
          ));
        } else if (status === 'out_of_stock') {
          // add the params for considered expired stock as being out of stock
          const paramsFilter = {
            dateTo : new Date(),
            depot_uuid : depot.depot_uuid,
            status : 'stock_out',
            enable_expired_stock_out,
            month_average_consumption,
            average_consumption_algo,
            min_delay,
          };

          dbPromises.push(core.getInventoryQuantityAndConsumption(
            paramsFilter,
            month_average_consumption,
          ));
        } else if (status === 'at_risk_expiration') {
          const paramsGetLots = {
            depot_uuid : depot.depot_uuid,
            period : 'allTime',
            includeEmptyLot : '0',
            is_expiry_risk : '1',
            month_average_consumption,
            average_consumption_algo,
            min_delay,
          };

          dbPromises.push(core.getLotsDepot(
            null,
            paramsGetLots,
          ));
        } else if (status === 'at_risk_out_stock') {
          const paramsFilter = {
            period : 'allTime',
            depot_uuid : depot.depot_uuid,
            includeEmptyLot : '0',
            status : 'security_reached',
          };

          dbPromises.push(core.getInventoryQuantityAndConsumption(
            paramsFilter,
            month_average_consumption,
            average_consumption_algo,
          ));
        } else if (status === 'over_max') {
          const paramsFilter = {
            period : 'allTime',
            depot_uuid : depot.depot_uuid,
            includeEmptyLot : '0',
            status : 'over_maximum',
          };

          dbPromises.push(core.getInventoryQuantityAndConsumption(
            paramsFilter,
            month_average_consumption,
            average_consumption_algo,
          ));
        } else if (status === 'require_po') {
          const paramsFilter = {
            period : 'allTime',
            depot_uuid : depot.depot_uuid,
            includeEmptyLot : '1',
            require_po : '1',
          };

          dbPromises.push(core.getInventoryQuantityAndConsumption(
            paramsFilter,
            month_average_consumption,
            average_consumption_algo,
          ));
        } else if (status === 'minimum_reached') {
          const paramsFilter = {
            period : 'allTime',
            depot_uuid : depot.depot_uuid,
            includeEmptyLot : '0',
            status : 'minimum_reached',
          };

          dbPromises.push(core.getInventoryQuantityAndConsumption(
            paramsFilter,
            month_average_consumption,
            average_consumption_algo,
          ));
        }
      });

      return Promise.all(dbPromises);
    })
    .then((rows) => {
      depotsByUser.forEach((depot) => {
        let count = 0;
        depot.count = count;

        rows.forEach(row => {
          if (row.length) {
            if (status !== 'at_risk_expiration') {
              row.forEach(item => {
                if (depot.depot_uuid === item.depot_uuid) {
                  count++;
                }
              });
            } else {
              const filteredData = row.filter(i => i.depot_uuid === depot.depot_uuid);

              if (filteredData.length) {
                const inventoriesAtRisk = filteredData.map(i => i.inventory_uuid);

                // Remove duplicate values from Inventory at risk expiration
                const uniqInventory = inventoriesAtRisk.reduce((a, b) => {
                  if (a.indexOf(b) < 0) a.push(b);
                  return a;
                }, []);
                count = uniqInventory.length;
              }
            }
          }
        });

        depot.count = count;
      });

      const filteredData = depotsByUser.filter(item => item.count > 0);

      res.status(200).json(filteredData);
    })
    .catch(next)
    .done();
}

/**
 * GET /stock/lots/depots/
 * returns list of each lots in each depots with their quantities
 */
async function listLotsDepot(req, res, next) {
  const params = req.query;

  params.month_average_consumption = req.session.stock_settings.month_average_consumption;
  params.average_consumption_algo = req.session.stock_settings.average_consumption_algo;
  params.min_delay = req.session.stock_settings.min_delay;
  params.default_purchase_interval = req.session.stock_settings.default_purchase_interval;

  if (req.session.stock_settings.enable_strict_depot_permission) {
    params.check_user_id = req.session.user.id;
  }

  if (params.period) {
    params.defaultPeriodEntry = params.period;
    delete params.period;
  }

  try {
    const data = await core.getLotsDepot(null, params);

    // if we have an empty set, do not query tags.
    if (data.length !== 0) {
      const queryTags = `
        SELECT BUID(t.uuid) uuid, t.name, t.color, BUID(lt.lot_uuid) lot_uuid
        FROM tags t
          JOIN lot_tag lt ON lt.tag_uuid = t.uuid
        WHERE lt.lot_uuid IN (?)
      `;
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
 * GET /stock/lots/depots/
 * returns list of each lots in each depots with their quantities
 */
async function listLotsDepotDetailed(req, res, next) {
  const params = req.query;

  params.startDate = moment(new Date(params.startDate)).format('YYYY-MM-DD');
  params.dateTo = moment(new Date(params.dateTo)).format('YYYY-MM-DD');
  const lastDayPreviousMonth = moment(params.startDate).subtract(1, 'day').format('YYYY-MM-DD');

  params.month_average_consumption = req.session.stock_settings.month_average_consumption;
  params.average_consumption_algo = req.session.stock_settings.average_consumption_algo;
  params.min_delay = req.session.stock_settings.min_delay;
  params.default_purchase_interval = req.session.stock_settings.default_purchase_interval;

  if (req.session.stock_settings.enable_strict_depot_permission) {
    params.check_user_id = req.session.user.id;
  }

  if (params.period) {
    params.defaultPeriodEntry = params.period;
    delete params.period;
  }

  const paramsPrevious = {
    dateTo : lastDayPreviousMonth,
    depot_uuid : params.depot_uuid,
    includeEmptyLot : 0,
    month_average_consumption : req.session.stock_settings.month_average_consumption,
    average_consumption_algo : req.session.stock_settings.average_consumption_algo,
    min_delay : req.session.stock_settings.min_delay,
    default_purchase_interval : req.session.stock_settings.default_purchase_interval,
    check_user_id : params.check_user_id,
  };

  try {
    const sqlGetMonthlyStockMovements = `
      SELECT BUID(l.inventory_uuid) AS inventory_uuid, BUID(sm.lot_uuid) AS lot_uuid,
        sm.date, inv.text AS inventoryText,
        l.label, SUM(IF(sm.is_exit = 1, sm.quantity, 0)) AS exit_quantity,
        SUM(IF(sm.is_exit = 0, sm.quantity, 0)) AS entry_quantity
      FROM stock_movement AS sm
      JOIN lot AS l ON l.uuid = sm.lot_uuid
      JOIN inventory AS inv ON inv.uuid = l.inventory_uuid
      WHERE sm.depot_uuid = ?
      AND DATE(sm.date) >= DATE(?) AND DATE(sm.date) <= DATE(?)
      GROUP BY l.uuid, sm.date;
    `;

    const [
      data,
      dataPreviousMonth,
      dataStockMovements,
    ] = await Promise.all([
      core.getLotsDepot(null, params),
      core.getLotsDepot(null, paramsPrevious),
      db.exec(sqlGetMonthlyStockMovements, [db.bid(params.depot_uuid), params.startDate, params.dateTo]),
    ]);

    data.forEach(current => {
      current.quantity_opening = 0;
      current.total_quantity_entry = 0;
      current.total_quantity_exit = 0;

      dataPreviousMonth.forEach(previous => {
        if (current.uuid === previous.uuid) {
          current.quantity_opening = previous.quantity;
        }
      });

      dataStockMovements.forEach(row => {
        if (current.uuid === row.lot_uuid) {
          current.total_quantity_entry = row.entry_quantity;
          current.total_quantity_exit = row.exit_quantity;
        }
      });
    });

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

  // expose connected user data
  if (req.session.stock_settings.enable_strict_depot_permission) {
    params.check_user_id = req.session.user.id;
  }

  params.month_average_consumption = req.session.stock_settings.month_average_consumption;
  params.average_consumption_algo = req.session.stock_settings.average_consumption_algo;
  params.min_delay = req.session.stock_settings.min_delay;
  params.default_purchase_interval = req.session.stock_settings.default_purchase_interval;
  params.enable_expired_stock_out = req.session.stock_settings.enable_expired_stock_out;

  try {
    // FIXME(@jniles) - these two call essentially the same route.  Do we need both?
    const [inventories, lots] = await Promise.all([
      core.getInventoryQuantityAndConsumption(params),
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

          // NOTE(@jniles): at this point, we've called computeLotIndicators() in the
          // core.getLotsDepot() function.  This means we can use all the flags defined
          // in that function to compute those here.
          const lot = lots[j];

          if (lot.exhausted) {
            // skip exhausted lots
          } else if (lot.expired) {
            hasExpiredLots = true;
            expiredLotsQuantity += lot.quantity;
          } else if (lot.near_expiration) {
            hasNearExpireLots = true;
            nearExpireLotsQuantity += lot.quantity;

          // flag if any lots are at risk of running out
          } else if (lot.S_RISK_QUANTITY > 0) {
            hasRiskyLots = true;
            riskyLotsQuantity += lot.S_RISK_QUANTITY;
          }
        }
      }

      inventories[i].hasNearExpireLots = hasNearExpireLots;
      inventories[i].hasRiskyLots = hasRiskyLots;
      inventories[i].hasExpiredLots = hasExpiredLots;

      inventories[i].nearExpireLotsQuantity = nearExpireLotsQuantity;
      inventories[i].riskyLotsQuantity = riskyLotsQuantity;
      inventories[i].expiredLotsQuantity = expiredLotsQuantity;
      inventories[i].usableAvailableStock = inventories[i].quantity - expiredLotsQuantity;
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

/**
 * POST /stock/aggregated_consumption
 * Stock Aggregated Consumption
 */
async function createAggregatedConsumption(req, res, next) {
  try {
    const movement = req.body;
    let filteredInvalidData = [];

    const paramsStock = {
      dateTo : new Date(),
      depot_uuid : movement.depot_uuid,
      includeEmptyLot : 0,
      month_average_consumption : req.session.stock_settings.month_average_consumption,
      average_consumption_algo : req.session.stock_settings.average_consumption_algo,
    };

    if (!movement.depot_uuid) {
      throw new Error('No defined depot');
    }

    const checkInvalid = movement.lots
      .filter(l => ((l.quantity_consumed + l.quantity_lost) > l.oldQuantity));

    if (checkInvalid.length) {
      throw new Error('Invalid data!  Some lots have consumed or lost more stock than they originally had.');
    }

    const stockAvailable = await core.getLotsDepot(null, paramsStock);

    movement.lots.forEach(lot => {
      lot.quantityAvailable = 0;

      lot.outputQuantity = lot.quantity_consumed + lot.quantity_lost;

      if (stockAvailable) {
        stockAvailable.forEach(stock => {
          if (stock.uuid === lot.uuid) {
            lot.quantityAvailable = stock.quantity;
          }
        });
      }
    });

    filteredInvalidData = await movement.lots.filter(l => l.outputQuantity > l.quantityAvailable);

    if (filteredInvalidData.length) {
      throw new BadRequest(
        `This aggregate stock consumption will overconsume
          the quantity in stock and generate negative quantity in stock`,
        `ERRORS.ER_PREVENT_NEGATIVE_QUANTITY_IN_AGGREGATE_CONSUMPTION`,
      );
    }

    // Here we want that the detailed consumption can only concern the periods when there is out of stock
    movement.lots.forEach(lot => {
      if (movement.stock_out[lot.inventory_uuid] === 0) {
        lot.detailed = [];
      }

      // Here we initialize an empty array just to check that there are no details
      if (!lot.detailed) {
        lot.detailed = [];
      }
    });

    // only consider lots that have consumed or lost.
    // Here we filter the consumption of batches that do not have chronological details
    const lots = movement.lots
      .filter(l => ((l.quantity_consumed > 0 || l.quantity_lost > 0) && (l.detailed.length === 0)));

    const consumptionDetailed = movement.lots
      .filter(l => l.detailed);

    const periodId = movement.period_id;

    // pass reverse operations
    const trx = db.transaction();

    // unique inventoryUuids
    const inventoryUuids = lots
      .map(lot => lot.inventory_uuid)
      .filter((uid, index, array) => array.lastIndexOf(uid) === index);

    inventoryUuids.forEach(inventoryUuid => {
      const daysStockOut = movement.stock_out[inventoryUuid];
      let movementDate = (daysStockOut > 0) ? moment(movement.date).subtract(daysStockOut, 'day') : movement.date;
      movementDate = new Date(movementDate);
      movementDate = movementDate.setHours(23, 30, 0);

      const consumptionUuid = uuid();
      const lossUuid = uuid();

      // get all lots with positive quantity_consumed
      const stockConsumptionQuantities = lots.filter(lot => (
        lot.inventory_uuid === inventoryUuid && lot.quantity_consumed > 0));

      // get all lots with negative quantity_lost
      const stockLossQuantities = lots.filter(lot => (lot.inventory_uuid === inventoryUuid && lot.quantity_lost > 0));

      stockConsumptionQuantities.forEach(lot => {
        const consumptionMovementObject = {
          uuid : db.bid(uuid()),
          lot_uuid : db.bid(lot.uuid),
          depot_uuid : db.bid(movement.depot_uuid),
          document_uuid : db.bid(consumptionUuid),
          quantity : lot.quantity_consumed,
          unit_cost : lot.unit_cost,
          date : new Date(movementDate),
          is_exit : 1,
          flux_id : core.flux.AGGREGATE_CONSUMPTION,
          description : movement.description,
          user_id : req.session.user.id,
          period_id : periodId,
        };

        trx.addQuery('INSERT INTO stock_movement SET ?', consumptionMovementObject);
      });

      stockLossQuantities.forEach(lot => {
        const lossMovementObject = {
          uuid : db.bid(uuid()),
          lot_uuid : db.bid(lot.uuid),
          depot_uuid : db.bid(movement.depot_uuid),
          document_uuid : db.bid(lossUuid),
          quantity : lot.quantity_lost,
          unit_cost : lot.unit_cost,
          date : new Date(movementDate),
          is_exit : 1,
          flux_id : core.flux.TO_LOSS,
          description : movement.description,
          user_id : req.session.user.id,
          period_id : periodId,
        };

        trx.addQuery('INSERT INTO stock_movement SET ?', lossMovementObject);
      });

      const stockConsumptionParams = [
        db.bid(consumptionUuid), 1, req.session.project.id,
      ];

      const stockLossParams = [
        db.bid(lossUuid), 1, req.session.project.id,
      ];

      if (req.session.stock_settings.enable_auto_stock_accounting) {
        if (stockConsumptionQuantities.length > 0) {
          trx.addQuery('CALL PostStockMovement(?)', [stockConsumptionParams]);
        }

        if (stockLossQuantities.length > 0) {
          trx.addQuery('CALL PostStockMovement(?)', [stockLossParams]);
        }
      }
    });

    consumptionDetailed.forEach(item => {
      item.detailed.forEach(elt => {
        const consumptionUuid = uuid();
        const lossUuid = uuid();

        let eltDate = new Date(elt.end_date);
        eltDate = eltDate.setHours(23, 30, 0);

        const formatStartDate = moment(elt.start_date).format('DD/MM/YYYY');
        const formatEndDate = moment(elt.end_date).format('DD/MM/YYYY');

        if (elt.quantity_consumed > 0) {
          const consumptionMovementObject = {
            uuid : db.bid(uuid()),
            lot_uuid : db.bid(item.uuid),
            depot_uuid : db.bid(movement.depot_uuid),
            document_uuid : db.bid(consumptionUuid),
            quantity : elt.quantity_consumed,
            unit_cost : item.unit_cost,
            date : new Date(eltDate),
            is_exit : 1,
            flux_id : core.flux.AGGREGATE_CONSUMPTION,
            description : `${movement.description} [${formatStartDate} - ${formatEndDate}]`,
            user_id : req.session.user.id,
            period_id : periodId,
          };

          trx.addQuery('INSERT INTO stock_movement SET ?', consumptionMovementObject);
        }

        if (elt.quantity_lost > 0) {
          const lossMovementObject = {
            uuid : db.bid(uuid()),
            lot_uuid : db.bid(item.uuid),
            depot_uuid : db.bid(movement.depot_uuid),
            document_uuid : db.bid(lossUuid),
            quantity : elt.quantity_lost,
            unit_cost : item.unit_cost,
            date : new Date(eltDate),
            is_exit : 1,
            flux_id : core.flux.TO_LOSS,
            description : `${movement.description} [${formatStartDate} - ${formatEndDate}]`,
            user_id : req.session.user.id,
            period_id : periodId,
          };

          trx.addQuery('INSERT INTO stock_movement SET ?', lossMovementObject);
        }
      });
    });

    await trx.execute();

    // we need to update the quantities at the beginning of the period.  So, we
    // construct the start date of the period from the period_id.
    const year = String(movement.period_id).slice(0, 4);
    const month = String(movement.period_id).slice(4);
    const date = `${year}-${month}-01`;

    // update quantities in stock after movement
    await updateQuantityInStockAfterMovement(inventoryUuids, date, movement.depot_uuid);

    res.status(201).json({});
  } catch (err) {
    next(err);
  }
}
