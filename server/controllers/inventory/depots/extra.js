/**
 * Depots Inventory Subroutes
 *
 * @description
 * This module contains the depots/inventories subroutes.  They are useful for testing certain statistics about
 * the depots.
 */

const router = require('express').Router({ mergeParams : true });
const db = require('../../../lib/db');
const core = require('../../stock/core');
const inv = require('../inventory/core');

exports.router = router;

router.get('/inventories', getInventory);
router.get('/users', getUsers);

/*
router.get('/movements', getDepotStockMovements);
router.get('/movements/:fluxId', getDepotStockMovementsByFluxType);
*/

router.get('/inventories/:inventoryUuid/cmm', getInventoryAverageMonthlyConsumption);
router.get('/inventories/:inventoryUuid/lots', getInventoryLots);

/**
 * @function getInventory
 *
 * @description
 * Returns the inventory in a particular depot by its UUID.
 */
async function getInventory(req, res, next) {
  try {
    const monthAvgConsumption = req.session.stock_settings.month_average_consumption;
    const averageConsumptionAlgo = req.session.stock_settings.average_consumption_algo;
    const inventory = await core.getInventoryQuantityAndConsumption(
      { depot_uuid : req.params.uuid },
      monthAvgConsumption,
      averageConsumptionAlgo,
    );

    res.status(200).json(inventory);
  } catch (err) {
    next(err);
  }
}

/**
 * @function getUsers
 *
 * @description
 * Get the users that have acces to a particular depot by its UUID.
 */
async function getUsers(req, res, next) {
  const sql = `
    SELECT user.id, user.username, user.email, user.display_name,
      user.active, user.last_login AS lastLogin, user.deactivated,
      GROUP_CONCAT(DISTINCT role.label ORDER BY role.label DESC SEPARATOR ', ') AS roles,
      GROUP_CONCAT(DISTINCT cb.label ORDER BY cb.label DESC SEPARATOR ', ') AS cashboxes
    FROM user
      JOIN depot_permission dp ON dp.user_id = user.id
      LEFT JOIN user_role ur ON user.id = ur.user_id
      LEFT JOIN role ON role.uuid = ur.role_uuid
      LEFT JOIN cashbox_permission ON user.id = cashbox_permission.user_id
      LEFT JOIN cash_box cb ON cashbox_permission.cashbox_id = cb.id
    WHERE dp.depot_uuid = ?
    GROUP BY user.id;
  `;

  try {
    const users = await db.exec(sql, db.bid(req.params.uuid));
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}

/**
 * @function getInventoryAverageMonthlyConsumption
 *
 * @description
 * Returns the Average Monthly Consumption (AMC/CMM) for a particular inventory
 * UUID in a particular depot.
 */
async function getInventoryAverageMonthlyConsumption(req, res, next) {
  const { uuid, inventoryUuid } = req.params;
  try {
    const [[averageMonthlyConsumption]] = await db.exec(
      'CALL GetAMC(DATE(NOW()), ?, ?);',
      [db.bid(uuid), db.bid(inventoryUuid)],
    );

    const sql = `SELECT
      BUID(d.uuid) as uuid, d.text, d.description, d.is_warehouse,
      allow_entry_purchase, allow_entry_donation, allow_entry_integration, allow_entry_transfer,
      allow_exit_debtor, allow_exit_service, allow_exit_transfer, allow_exit_loss,
      BUID(parent_uuid) parent_uuid, dhis2_uid,
      min_months_security_stock, default_purchase_interval
    FROM depot AS d
    WHERE d.enterprise_id = ? AND d.uuid = ?;`;

    const [[inventory], [depot]] = await Promise.all([
      inv.getItemsMetadata({ uuid : inventoryUuid }),
      db.exec(sql, [req.session.enterprise.id, db.bid(uuid)]),
    ]);

    const settings = req.session.stock_settings;

    res.status(200).json({
      ...averageMonthlyConsumption, inventory, depot, settings,
    });
  } catch (err) {
    next(err);
  }
}

async function getInventoryLots(req, res, next) {
  try {
    const options = { inventory_uuid : req.params.inventoryUuid, ...req.session.stock_settings };
    const inventory = await core.getLotsDepot(req.params.uuid, options);
    res.status(200).json(inventory);
  } catch (err) {
    next(err);
  }
}

/*
async function getDepotStockMovements(req, res, next) {
  try {
    const movements = await core.getLotsMovements(req.params.uuid, req.query);
    res.status(200).json(movements);
  } catch (err) {
    next(err);
  }

}

async function getDepotStockMovementsByFluxType(req, res, next) {

}
*/
