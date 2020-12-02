/**
 * @module stock/core
 *
 * @description
 * This module is responsible for handling all function utility for stock
 *
 * @requires moment
 * @requires lodash
 * @requires lib/db
 * @requires lib/filter
 * @requires lib/util
 */

const _ = require('lodash');
const moment = require('moment');
const db = require('../../lib/db');
const FilterParser = require('../../lib/filter');
const util = require('../../lib/util');

const flux = {
  FROM_PURCHASE    : 1,
  FROM_OTHER_DEPOT : 2,
  FROM_ADJUSTMENT  : 3,
  FROM_PATIENT     : 4,
  FROM_SERVICE     : 5,
  FROM_DONATION    : 6,
  FROM_LOSS        : 7,
  TO_OTHER_DEPOT   : 8,
  TO_PATIENT       : 9,
  TO_SERVICE       : 10,
  TO_LOSS          : 11,
  TO_ADJUSTMENT    : 12,
  FROM_INTEGRATION : 13,
  INVENTORY_RESET  : 14,
  INVENTORY_ADJUSTMENT : 15,
};

// exports
module.exports = {
  flux,
  getMovements,
  getLots,
  getLotsDepot,
  getLotsMovements,
  getLotsOrigins,
  listStatus,
  // stock consumption
  getInventoryQuantityAndConsumption,
  getInventoryMovements,
  getDailyStockConsumption,
};

/**
 * @function getLotFilters
 *
 * @description
 * Groups all filtering functionality used in the different getLots* functions into
 * a single function.  The filterparser is returned so that any additional modifications
 * can be made in the function before execution.
 *
 * @param {Object} parameters - an object of filter params.
 */

function getLotFilters(parameters) {
  // clone the parameters
  const params = { ...parameters };

  db.convert(params, [
    'uuid',
    'depot_uuid',
    'lot_uuid',
    'inventory_uuid',
    'group_uuid',
    'document_uuid',
    'entity_uuid',
    'service_uuid',
    'invoice_uuid',
    'purchase_uuid',
    'tag_uuid',
    'tags',
    'stock_requisition_uuid',
  ]);

  const filters = new FilterParser(params);

  filters.equals('uuid', 'uuid', 'l');
  filters.equals('is_assigned', 'is_assigned', 'l');
  filters.equals('depot_text', 'text', 'd');
  filters.equals('depot_uuid', 'depot_uuid', 'm');
  filters.equals('entity_uuid', 'entity_uuid', 'm');
  filters.equals('document_uuid', 'document_uuid', 'm');
  filters.equals('lot_uuid', 'lot_uuid', 'm');
  filters.equals('inventory_uuid', 'uuid', 'i');
  filters.equals('consumable', 'consumable', 'i');
  filters.equals('group_uuid', 'uuid', 'ig');
  filters.equals('text', 'text', 'i');
  filters.equals('label', 'label', 'l');
  filters.equals('period_id', 'period_id', 'm');
  filters.equals('is_exit', 'is_exit', 'm');
  filters.equals('flux_id', 'flux_id', 'm', true);
  filters.equals('reference', 'text', 'dm');
  filters.equals('service_uuid', 'uuid', 'serv');
  filters.equals('invoice_uuid', 'invoice_uuid', 'm');
  filters.equals('purchase_uuid', 'origin_uuid', 'l');
  filters.equals('tag_uuid', 'tags', 't');
  filters.equals('stock_requisition_uuid', 'stock_requisition_uuid', 'm');

  // depot permission check
  filters.custom(
    'check_user_id',
    'd.uuid IN (SELECT depot_uuid FROM depot_permission WHERE user_id = ?)',
  );

  // tags
  filters.custom('tags', 't.uuid IN (?)', [params.tags]);

  // NOTE(@jniles)
  // is_expired is based off the server time, not off the client time.
  filters.custom('is_expired',
    'IF(DATE(l.expiration_date) < DATE(NOW()), 1, 0) = ?');

  // NOTE(@jniles):
  // this filters the lots on the entity_uuid associated with the text reference.  It is
  // an "IN" filter because the patient could have a patient_uuid or debtor_uuid specified.
  filters.custom('patientReference',
    'entity_uuid IN (SELECT uuid FROM entity_map WHERE text = ?)');

  filters.period('defaultPeriod', 'date');
  filters.period('defaultPeriodEntry', 'entry_date', 'l');
  filters.period('period', 'date');

  filters.dateFrom('expiration_date_from', 'expiration_date', 'l');
  filters.dateTo('expiration_date_to', 'expiration_date', 'l');

  /**
   * the real entry date for a lot is the MIN(movement.date) for a
   * lot in a given depot so that we can identify for each depot
   * the entry date of a lot
   */
  filters.dateFrom('entry_date_from', 'date', 'm');
  filters.dateTo('entry_date_to', 'date', 'm');

  filters.dateFrom('dateFrom', 'date', 'm');
  filters.dateTo('dateTo', 'date', 'm');

  filters.dateFrom('custom_period_start', 'date', 'm');
  filters.dateTo('custom_period_end', 'date', 'm');

  filters.equals('user_id', 'user_id', 'm');

  return filters;
}

/**
 * @function getLots
 *
 * @description returns a list of lots
 *
 * @param {string} sql - An optional sql script of selecting in lot
 * @param {object} parameters - A request query object
 * @param {string} finalClauseParameter - An optional final clause (GROUP BY, HAVING, ...) to add to query built
 */
function getLots(sqlQuery, parameters, finalClause = '', orderBy) {
  const sql = sqlQuery || `
      SELECT
        BUID(l.uuid) AS uuid, l.label, l.initial_quantity, l.unit_cost, BUID(l.origin_uuid) AS origin_uuid,
        l.expiration_date, BUID(l.inventory_uuid) AS inventory_uuid, i.delay, l.entry_date,
        i.code, i.text, BUID(m.depot_uuid) AS depot_uuid, d.text AS depot_text, iu.text AS unit_type,
        BUID(ig.uuid) AS group_uuid, ig.name AS group_name,
        dm.text AS documentReference, ser.name AS service_name
      FROM lot l
      JOIN inventory i ON i.uuid = l.inventory_uuid
      JOIN inventory_unit iu ON iu.id = i.unit_id
      JOIN inventory_group ig ON ig.uuid = i.group_uuid
      JOIN stock_movement m ON m.lot_uuid = l.uuid AND m.flux_id = ${flux.FROM_PURCHASE}
      LEFT JOIN document_map dm ON dm.uuid = m.document_uuid
      LEFT JOIN service AS ser ON ser.uuid = m.entity_uuid
      JOIN depot d ON d.uuid = m.depot_uuid
  `;
  const filters = getLotFilters(parameters);

  // if finalClause is an empty string, filterParser will not group, it will be an empty string
  filters.setGroup(finalClause);

  // add order by if it exists
  if (orderBy) {
    filters.setOrder(orderBy);
  }

  const query = filters.applyQuery(sql);
  const queryParameters = filters.parameters();

  return db.exec(query, queryParameters);
}

/**
 * @function getLotsDepot
 *
 * @description returns lots with their real quantity in each depots
 *
 * @param {number} depot_uuid - optional depot uuid for retrieving on depot
 *
 * @param {object} params - A request query object
 *
 * @param {string} finalClause - An optional final clause (GROUP BY, ...) to add to query built
 */
async function getLotsDepot(depotUuid, params, finalClause) {
  let _status;
  let emptyLotToken = ''; // query token to include/exclude empty lots

  if (depotUuid) {
    params.depot_uuid = depotUuid;
  }

  if (params.status) {
    _status = params.status;
    delete params.status;
  }

  const includeEmptyLot = Number(params.includeEmptyLot);
  if (includeEmptyLot === 0) {
    emptyLotToken = 'HAVING quantity > 0';
    delete params.includeEmptyLot;
  } else if (includeEmptyLot === 2) {
    emptyLotToken = 'HAVING quantity = 0';
  }

  const sql = `
    SELECT BUID(l.uuid) AS uuid, l.label, l.initial_quantity,
      SUM(m.quantity * IF(m.is_exit = 1, -1, 1)) AS quantity,
      SUM(m.quantity) AS mvt_quantity,
      d.text AS depot_text, l.unit_cost, l.expiration_date,
      d.min_months_security_stock,
      ROUND(DATEDIFF(l.expiration_date, CURRENT_DATE()) / 30.5) AS lifetime,
      BUID(l.inventory_uuid) AS inventory_uuid, BUID(l.origin_uuid) AS origin_uuid,
      i.code, i.text, BUID(m.depot_uuid) AS depot_uuid,
      m.date AS entry_date, i.avg_consumption, i.purchase_interval, i.delay,
      iu.text AS unit_type,
      ig.name AS group_name, ig.tracking_expiration, ig.tracking_consumption,
      dm.text AS documentReference, t.name AS tag_name, t.color
    FROM stock_movement m
      JOIN lot l ON l.uuid = m.lot_uuid
      JOIN inventory i ON i.uuid = l.inventory_uuid
      JOIN inventory_unit iu ON iu.id = i.unit_id
      JOIN inventory_group ig ON ig.uuid = i.group_uuid
      JOIN depot d ON d.uuid = m.depot_uuid
      LEFT JOIN document_map dm ON dm.uuid = m.document_uuid
      LEFT JOIN lot_tag lt ON lt.lot_uuid = l.uuid
      LEFT JOIN tags t ON t.uuid = lt.tag_uuid
  `;

  const groupByClause = finalClause || ` GROUP BY l.uuid, m.depot_uuid ${emptyLotToken} ORDER BY i.code, l.label `;

  const filters = getLotFilters(params);
  filters.setGroup(groupByClause);

  const query = filters.applyQuery(sql);
  const queryParameters = filters.parameters();

  const resultFromProcess = await db.exec(query, queryParameters);

  // calulate the CMM and add inventory flags.
  const inventoriesWithManagementData = await getBulkInventoryCMM(
    resultFromProcess,
    params.month_average_consumption,
    params.average_consumption_algo,
  );

  // FIXME(@jniles) - this step seems to mostly just change the ordering of lots.  Can we combine
  // it with the getBulkInventoryCMM?
  let inventoriesWithLotsProcessed = computeLotIndicators(inventoriesWithManagementData);

  if (_status) {
    inventoriesWithLotsProcessed = inventoriesWithLotsProcessed.filter(row => row.status === _status);
  }

  // Since the status of a product risking expiry is only defined
  // after the comparison with the CMM, reason why the filtering
  // is not carried out with an SQL request
  if (parseInt(params.is_expiry_risk, 10) === 1) {
    inventoriesWithLotsProcessed = inventoriesWithLotsProcessed.filter(item => (item.S_RISK < 0 && item.lifetime > 0));
  }

  if (parseInt(params.is_expiry_risk, 10) === 0) {
    inventoriesWithLotsProcessed = inventoriesWithLotsProcessed.filter(item => (item.S_RISK >= 0 && item.lifetime > 0));
  }

  return inventoriesWithLotsProcessed;
}

/**
 * @function getBulkInventoryCMM
 *
 * @description
 * This function takes in an array of lots or inventory items and computes the CMM for all unique
 * inventory/depot pairings in the array.  It then creates a mapping for the CMMs in memory and uses
 * those to compute the relevant indicators.
 */
async function getBulkInventoryCMM(lots, monthAverageConsumption, averageConsumptionAlgo) {
  if (!lots.length) return [];

  // NOTE(@jniles) - this is a developer sanity check. Fail _hard_ if the query is underspecified
  // Throw an error if we don't have the monthAverageConsumption or averageConsumptionAlgo passed in.
  if (!monthAverageConsumption || !averageConsumptionAlgo) {
    throw new Error('Cannot calculate the AMC without consumption parameters!');
  }

  // create a list of unique depot/inventory_uuid combinations to avoid querying the server multiple
  // times for the same inventory item.
  const params = _.chain(lots)
    .map(row => ([monthAverageConsumption, row.inventory_uuid, row.depot_uuid]))
    .uniqBy(row => row.toString())
    .value();

  // query the server
  const cmms = await Promise.all(
    params.map(row => db.exec(`CALL getCMM(DATE_SUB(NOW(), INTERVAL ? MONTH), NOW(), HUID(?), HUID(?))`, row)
      .then(values => values[0][0])),
  );

  // create a map of the CMM values keys on the depot/inventory pairing.
  const cmmMap = new Map(cmms.map(row => ([`${row.depot_uuid}-${row.inventory_uuid}`, row])));

  // quick function to query the above map.
  const getCMMForLot = (depotUuid, inventoryUuid) => cmmMap.get(`${depotUuid}-${inventoryUuid}`);

  lots.forEach(lot => {
    const lotCMM = getCMMForLot(lot.depot_uuid, lot.inventory_uuid);
    if (lotCMM) {
      lot.cmms = lotCMM;
      lot.avg_consumption = lot.cmms[averageConsumptionAlgo];
    } else {
      lot.cmms = {};
      lot.avg_consumption = 0;
    }
  });

  // now that we have the CMMs correctly mapped, we can compute the inventory indicators
  const result = computeInventoryIndicators(lots);
  return result;
}

/**
 * @function getLotsMovements
 *
 * @description returns lots movements for each depots
 *
 * @param {number} depot_uuid - optional depot uuid for retrieving on depot
 *
 * @param {object} params - A request query object
 */
async function getLotsMovements(depotUuid, params) {
  let finalClause;

  if (depotUuid) {
    params.depot_uuid = depotUuid;
  }

  if (params.groupByDocument === 1) {
    finalClause = 'GROUP BY document_uuid, is_exit';
    delete params.groupByDocument;
  }

  const sql = `
    SELECT
      BUID(l.uuid) AS uuid, l.label, l.initial_quantity, m.quantity, m.reference, m.description,
      d.text AS depot_text, d.min_months_security_stock,
      IF(is_exit = 1, "OUT", "IN") AS io, l.unit_cost,
      l.expiration_date, BUID(l.inventory_uuid) AS inventory_uuid,
      BUID(l.origin_uuid) AS origin_uuid, l.entry_date, i.code, i.text,
      BUID(m.depot_uuid) AS depot_uuid, m.is_exit, m.date, BUID(m.document_uuid) AS document_uuid,
      m.flux_id, BUID(m.entity_uuid) AS entity_uuid, m.unit_cost,
      f.label AS flux_label, i.delay, BUID(m.invoice_uuid) AS invoice_uuid, idm.text AS invoice_reference,
      iu.text AS unit_type, dm.text AS documentReference
    FROM stock_movement m
    JOIN lot l ON l.uuid = m.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN inventory_unit iu ON iu.id = i.unit_id
    JOIN depot d ON d.uuid = m.depot_uuid
    JOIN flux f ON f.id = m.flux_id
    LEFT JOIN document_map dm ON dm.uuid = m.document_uuid
    LEFT JOIN document_map idm ON idm.uuid = m.invoice_uuid
    LEFT JOIN service AS serv ON serv.uuid = m.entity_uuid
  `;

  const orderBy = 'ORDER BY m.date, dm.text, l.label';
  const lots = await getLots(sql, params, finalClause, orderBy);

  return lots;
}

/**
 * @function getMovements
 *
 * @description returns movements for each depots
 *
 * @param {number} depot_uuid - optional depot uuid for retrieving on depot
 *
 * @param {object} params - A request query object
 */
async function getMovements(depotUuid, params) {

  if (depotUuid) {
    params.depot_uuid = depotUuid;
  }

  const sql = `
  SELECT
    m.description,
    d.text AS depot_text, IF(is_exit = 1, "OUT", "IN") AS io,
    BUID(m.depot_uuid) AS depot_uuid, m.is_exit, m.date, BUID(m.document_uuid) AS document_uuid,
    m.flux_id, BUID(m.entity_uuid) AS entity_uuid, SUM(m.unit_cost * m.quantity) AS cost,
    f.label AS flux_label, BUID(m.invoice_uuid) AS invoice_uuid, dm.text AS documentReference,
    BUID(m.stock_requisition_uuid) AS stock_requisition_uuid, sr_m.text AS document_requisition
  FROM stock_movement m
    JOIN lot l ON l.uuid = m.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN depot d ON d.uuid = m.depot_uuid
    JOIN flux f ON f.id = m.flux_id
    LEFT JOIN document_map dm ON dm.uuid = m.document_uuid
    LEFT JOIN service AS serv ON serv.uuid = m.entity_uuid
    LEFT JOIN document_map sr_m ON sr_m.uuid = m.stock_requisition_uuid
  `;

  const finalClause = 'GROUP BY document_uuid, is_exit';
  const orderBy = 'ORDER BY d.text, m.date';
  const movements = await getLots(sql, params, finalClause, orderBy);

  return movements;
}

/**
 * @function getLotsOrigins
 *
 * @description returns lot's origins
 *
 * @param {number} depot_uuid - optional depot uuid for retrieving on depot
 *
 * @param {object} params - A request query object
 */
function getLotsOrigins(depotUuid, params, averageConsumptionAlgo) {
  if (depotUuid) {
    params.depot_uuid = depotUuid;
  }

  const sql = `
    SELECT BUID(l.uuid) AS uuid, l.label, l.unit_cost, l.expiration_date,
        BUID(l.inventory_uuid) AS inventory_uuid, BUID(l.origin_uuid) AS origin_uuid,
        l.entry_date, i.code, i.text, origin.display_name, om.text AS reference,
        BUID(m.document_uuid) AS document_uuid, m.flux_id,
        iu.text AS unit_type,
        dm.text AS documentReference
    FROM lot l
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN inventory_unit iu ON iu.id = i.unit_id
    JOIN (
      SELECT p.uuid, 'STOCK.PURCHASE_ORDER' AS display_name FROM purchase
      UNION
      SELECT d.uuid, 'STOCK.DONATION' AS display_name FROM donation d
      UNION
      SELECT i.uuid, 'STOCK.INTEGRATION' AS display_name FROM integration i
    ) AS origin ON origin.uuid = l.origin_uuid
    JOIN stock_movement m ON m.lot_uuid = l.uuid
      AND m.is_exit = 0
        AND m.flux_id IN (${flux.FROM_PURCHASE}, ${flux.FROM_DONATION}, ${flux.FROM_INTEGRATION})
    LEFT JOIN document_map dm ON dm.uuid = m.document_uuid
    LEFT JOIN odcument_map om ON om.uuid = l.origin_uuid
  `;

  return getLots(sql, params, averageConsumptionAlgo);
}

/**
 * @function computeInventoryIndicators
 *
 * @description
 * This function acts on information coming from the getBulkInventoryCMM() function.  It's
 * separated for clarity.
 *
 * This could be either lots or inventory items passed in.
 *
 * Here is the order you should be executing these:
 *   getBulkInventoryCMM()
 *   computeInventoryIndicators()
 *   computeLotIndicators()
 *
 * DEFINITIONS:
 *   S_SEC: Security Stock - one month of stock on hand based on the average consumption.
 *   S_MIN: Minimum stock - typically the security stock (depends on the depot)
 */
function computeInventoryIndicators(inventories) {
  for (let i = 0; i < inventories.length; i++) {
    const inventory = inventories[i];

    // the quantity of stock available in the given depot
    const Q = inventory.quantity; // the quantity

    // Average Monthly Consumption (CMM/AMC)
    // This value is computed in the getBulkInventoryCMM() function.
    // It provides the average monthly consumption for the particular product.
    const CMM = inventory.avg_consumption;

    // Signal that no consumption has occurred of the inventory items
    inventory.NO_CONSUMPTION = (CMM === 0);

    // Compute the Security Stock
    // Security stock is defined by taking the average monthly consumption (AMC or CMM)
    // and multiplying it by the Lead Time (inventory.delay).  The Lead Time is by default 1 month.
    // This gives you a security stock quantity.
    inventory.S_SEC = CMM * inventory.delay; // stock de securite

    // Compute Minimum Stock
    // The minumum of stock required is double the security stock.
    // NOTE(@jniles): this is defined per depot.
    inventory.S_MIN = inventory.S_SEC * inventory.min_months_security_stock;

    // Compute Maximum Stock
    // The maximum stock is the minumum stock plus the amount able to be consumed in a
    // single purchase interval.
    inventory.S_MAX = (CMM * inventory.purchase_interval) + inventory.S_MIN; // stock maximum

    // Compute Months of Stock Remaining
    // The months of stock remaining is the quantity in stock divided by the Average
    // monthly consumption. Skip division by zero if the CMM is 0.
    inventory.S_MONTH = inventory.NO_CONSUMPTION ? null : Math.floor(inventory.quantity / CMM); // mois de stock

    // Compute the Refill Quantity
    // The refill quantity is the amount of stock needed to order to reach your maximum stock.
    inventory.S_Q = inventory.S_MAX - inventory.quantity; // Commande d'approvisionnement
    inventory.S_Q = inventory.S_Q > 0 ? parseInt(inventory.S_Q, 10) : 0;

    // compute the inventory status code
    if (Q <= 0) {
      inventory.status = 'stock_out';
      inventory.stock_out_date = inventory.last_movement_date;
    } else if (Q > 0 && Q <= inventory.S_SEC) {
      inventory.status = 'security_reached';
    } else if (Q > inventory.S_SEC && Q <= inventory.S_MIN) {
      inventory.status = 'minimum_reached';
    } else if (Q > inventory.S_MIN && Q <= inventory.S_MAX) {
      inventory.status = 'in_stock';
    } else if (Q > inventory.S_MAX) {
      inventory.status = 'over_maximum';
    } else {
      inventory.status = '';
    }

    // round
    inventory.S_SEC = util.roundDecimal(inventory.S_SEC, 2);
    inventory.S_MIN = util.roundDecimal(inventory.S_MIN, 2);
    inventory.S_MAX = util.roundDecimal(inventory.S_MAX, 2);
  }

  return inventories;
}

/**
 * @function getDailyStockConsumption
 *
 * @description returns the daily (periodic) stock consumption (CM)
 *
 * @param {array} periodIds
 */
async function getDailyStockConsumption(params) {

  const consumptionValue = `
    (i.consumable = 1 AND (
      (m.flux_id IN (${flux.TO_PATIENT}, ${flux.TO_SERVICE}))
      OR
      (m.flux_id = ${flux.TO_OTHER_DEPOT} AND d.is_warehouse = 1)
    ))
  `;

  db.convert(params, ['depot_uuid', 'inventory_uuid']);

  const filters = new FilterParser(params, { tableAlias : 'm' });

  const sql = `
    SELECT
      COUNT(m.uuid) as movement_number,
      SUM(m.quantity) as quantity,
      SUM(m.quantity * m.unit_cost) as value,
      DATE(m.date) as date,
      BUID(i.uuid) AS inventory_uuid,
      BUID(m.uuid) AS uuid,
      i.text AS inventory_name,
      d.text AS depot_name,
      BUID(d.uuid) AS depot_uuid
    FROM stock_movement m
    JOIN flux f ON m.flux_id = f.id
    JOIN lot l ON l.uuid = m.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN depot d ON d.uuid = m.depot_uuid
  `;

  filters.dateFrom('dateFrom', 'date');
  filters.dateTo('dateTo', 'date');
  filters.equals('depot_uuid', 'uuid', 'd');
  filters.equals('period_id');
  filters.equals('inventory_uuid', 'uuid', 'i');
  filters.equals('flux_id', 'id', 'f', true);
  filters.equals('is_exit');
  filters.custom('consumption', consumptionValue);

  if (params.consumption) {
    filters.setGroup('GROUP BY DATE(m.date), i.uuid');
  } else {
    filters.setGroup('GROUP BY DATE(m.date)');
  }

  filters.setOrder('ORDER BY m.date ');

  const rqtSQl = filters.applyQuery(sql);
  const rqtParams = filters.parameters();

  return db.exec(rqtSQl, rqtParams);
}

/**
 * Inventory Quantity and Consumptions
 */
async function getInventoryQuantityAndConsumption(params) {
  let _status;
  let requirePurchaseOrder;
  let emptyLotToken = ''; // query token to include/exclude empty lots

  if (params.status) {
    _status = params.status;
    delete params.status;
  }

  if (params.require_po) {
    requirePurchaseOrder = params.require_po;
    delete params.require_po;
  }

  const includeEmptyLot = Number(params.includeEmptyLot);
  if (includeEmptyLot === 0) {
    emptyLotToken = 'HAVING quantity > 0';
    delete params.includeEmptyLot;
  } else if (includeEmptyLot === 2) {
    emptyLotToken = 'HAVING quantity=0';
  }

  const sql = `
    SELECT BUID(l.uuid) AS uuid, l.label, l.initial_quantity,
      SUM(m.quantity * IF(m.is_exit = 1, -1, 1)) AS quantity,
      d.text AS depot_text, d.min_months_security_stock,
      l.unit_cost, l.expiration_date,
      ROUND(DATEDIFF(l.expiration_date, CURRENT_DATE()) / 30.5) AS lifetime,
      BUID(l.inventory_uuid) AS inventory_uuid, BUID(l.origin_uuid) AS origin_uuid,
      l.entry_date, BUID(i.uuid) AS inventory_uuid, i.code, i.text, BUID(m.depot_uuid) AS depot_uuid,
      i.avg_consumption, i.purchase_interval, i.delay, MAX(m.created_at) AS last_movement_date,
      iu.text AS unit_type, ig.tracking_consumption, ig.tracking_expiration,
      BUID(ig.uuid) AS group_uuid, ig.name AS group_name,
      dm.text AS documentReference, d.enterprise_id
    FROM stock_movement m
    JOIN lot l ON l.uuid = m.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN inventory_unit iu ON iu.id = i.unit_id
    JOIN inventory_group ig ON ig.uuid = i.group_uuid
    JOIN depot d ON d.uuid = m.depot_uuid
    LEFT JOIN document_map dm ON dm.uuid = m.document_uuid
  `;

  const clause = ` GROUP BY l.inventory_uuid, m.depot_uuid ${emptyLotToken} ORDER BY ig.name, i.text `;

  let filteredRows = await getLots(sql, params, clause);
  if (filteredRows.length === 0) { return []; }

  const settingsql = `
    SELECT month_average_consumption, average_consumption_algo FROM stock_setting WHERE enterprise_id = ?
  `;
  const opts = await db.one(settingsql, filteredRows[0].enterprise_id);

  // add the CMM
  filteredRows = await getBulkInventoryCMM(filteredRows, opts.month_average_consumption, opts.average_consumption_algo);

  if (_status) {
    filteredRows = filteredRows.filter(row => row.status === _status);
  }

  if (requirePurchaseOrder) {
    filteredRows = filteredRows.filter(row => row.S_Q > 0);
  }

  return filteredRows;
}

/**
 * @function computeLotIndicators
 * process multiple stock lots
 *
 * @description
 */
function computeLotIndicators(inventories) {
  const flattenLots = [];
  const inventoryByDepots = _.groupBy(inventories, 'depot_uuid');

  _.map(inventoryByDepots, (depotInventories) => {

    const inventoryLots = _.groupBy(depotInventories, 'inventory_uuid');

    _.map(inventoryLots, (lots) => {
      // if we don't have the default CMM (avg_consumption) use the
      // defined or computed CMM for each lots
      const cmm = _.max(lots.map(lot => lot.avg_consumption));

      // order lots also by ascending quantity
      // assuming the lot with lowest quantity is consumed first
      let orderedInventoryLots = _.orderBy(lots, 'quantity', 'asc');

      // order lots by ascending lifetime has a hight priority than quantity
      orderedInventoryLots = _.orderBy(orderedInventoryLots, 'lifetime', 'asc');

      // compute the lot coefficient
      let lotLifetime = 0;
      _.each(orderedInventoryLots, lot => {
        if (!lot.tracking_expiration) {
          lot.expiration_date = '';
        }

        if (lot.tracking_consumption) {
          // apply the same CMM to all lots and update monthly consumption
          lot.avg_consumption = cmm;
          lot.S_MONTH = cmm ? Math.floor(lot.quantity / cmm) : lot.quantity;

          const zeroMSD = Math.round(lot.S_MONTH) === 0;

          const numMonthsOfStockLeft = (lot.quantity / lot.CMM); // how many months of stock left
          const today = new Date();
          // if we have more months of stock than the expiration date,
          // then we'll need to label these are in risk of expiration
          const numDaysOfStockLeft = numMonthsOfStockLeft * 30.5;
          const isInRiskOfExpiration = lot.expiration_date <= moment(today).add(numDaysOfStockLeft, 'days').toDate();
          lot.IS_IN_RISK_EXPIRATION = isInRiskOfExpiration;

          lot.S_LOT_LIFETIME = zeroMSD || lot.lifetime < 0 ? 0 : lot.lifetime - lotLifetime;
          lot.S_RISK = zeroMSD ? 0 : lot.S_LOT_LIFETIME - lot.S_MONTH;
          lot.S_RISK_QUANTITY = Math.round(lot.S_RISK * lot.avg_consumption);
          lotLifetime += lot.S_LOT_LIFETIME;
        }
        flattenLots.push(lot);
      });
    });
  });

  return flattenLots;
}

/**
 * Inventory Movement Report
 */
function getInventoryMovements(params) {
  const bundle = {};

  const sql = `
    SELECT BUID(l.uuid) AS uuid, l.label, l.initial_quantity,
      d.text AS depot_text, d.min_months_security_stock,
      l.unit_cost, l.expiration_date,
      m.quantity, m.is_exit, m.date,
      BUID(l.inventory_uuid) AS inventory_uuid, BUID(l.origin_uuid) AS origin_uuid,
      l.entry_date, i.code, i.text, BUID(m.depot_uuid) AS depot_uuid,
      i.avg_consumption, i.purchase_interval, i.delay, iu.text AS unit_type,
      dm.text AS documentReference, flux.label as flux
    FROM stock_movement m
      JOIN lot l ON l.uuid = m.lot_uuid
      JOIN inventory i ON i.uuid = l.inventory_uuid
      JOIN inventory_unit iu ON iu.id = i.unit_id
      JOIN depot d ON d.uuid = m.depot_uuid
      JOIN flux ON m.flux_id = flux.id
      JOIN document_map dm ON dm.uuid = m.document_uuid
  `;

  const orderBy = params.orderByCreatedAt ? 'm.created_at' : 'm.date';

  return getLots(sql, params, ` ORDER BY ${orderBy} ASC `)
    .then((rows) => {
      bundle.movements = rows;

      // build the inventory report
      let stockQuantity = 0;
      let stockUnitCost = 0;
      let stockValue = 0;

      // stock method CUMP : cout unitaire moyen pondere
      const movements = bundle.movements.map(line => {
        const movement = {
          reference : line.documentReference,
          date : line.date,
          label : line.label,
          flux : line.flux,
          entry : { quantity : 0, unit_cost : 0, value : 0 },
          exit : { quantity : 0, unit_cost : 0, value : 0 },
          stock : { quantity : 0, unit_cost : 0, value : 0 },
        };

        if (line.is_exit) {
          stockQuantity -= line.quantity;
          stockValue = stockQuantity * stockUnitCost;
          // fix negative value disorder
          // ignoring negative stock value by setting them to zero for entry
          stockValue = (stockValue < 0) ? 0 : stockValue;

          // exit
          movement.exit.quantity = line.quantity;
          movement.exit.unit_cost = stockUnitCost;
          movement.exit.value = line.quantity * line.unit_cost;
        } else {
          const newQuantity = line.quantity + stockQuantity;
          // fix negative value disorder
          // ignoring negative stock value by setting them to movement value for exit
          const newValue = (stockValue < 0)
            ? (line.unit_cost * line.quantity)
            : (line.unit_cost * line.quantity) + stockValue;
          // don't use cumulated quantity when stock quantity < 0
          // in this case use movement quantity only
          const newCost = newValue / (stockQuantity < 0 ? line.quantity : newQuantity);

          stockQuantity = newQuantity;
          stockUnitCost = newCost;
          stockValue = newValue;

          // entry
          movement.entry.quantity = line.quantity;
          movement.entry.unit_cost = line.unit_cost;
          movement.entry.value = line.quantity * line.unit_cost;
        }

        // stock status
        movement.stock.quantity = stockQuantity;
        movement.stock.unit_cost = stockUnitCost;
        movement.stock.value = stockValue;

        return movement;
      });

      // totals of quantities
      const totals = movements.reduce((total, line) => {
        total.entry += line.entry.quantity;
        total.entryValue += line.entry.value;
        total.exit += line.exit.quantity;
        total.exitValue += line.exit.value;
        return total;
      }, {
        entry : 0, entryValue : 0, exit : 0, exitValue : 0,
      });

      // stock value
      const result = movements.length ? movements[movements.length - 1] : {};
      return { movements, totals, result };
    });
}

function listStatus(req, res, next) {
  const sql = `SELECT id, status_key, title_key FROM status`;
  db.exec(sql).then(status => {
    res.status(200).json(status);
  }).catch(next);
}
