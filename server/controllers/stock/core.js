/**
 * @module stock/core
 *
 * @description
 * This module is responsible for handling all function utility for stock
 *
 * @requires moment
 * @requires lib/db
 * @requires lib/filter
 * @requires config/identifiers
 **/

const moment = require('moment');
const db = require('../../lib/db');
const FilterParser = require('../../lib/filter');
const identifiers = require('../../config/identifiers');

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
};

const DATE_FORMAT = 'YYYY-MM-DD';
const BASE_NUMBER_OF_MONTHS = 6;

// exports
exports.flux = flux;
exports.getLots = getLots;
exports.getLotsDepot = getLotsDepot;
exports.getLotsMovements = getLotsMovements;
exports.getLotsOrigins = getLotsOrigins;
exports.stockManagementProcess = stockManagementProcess;

// stock consumption
exports.getStockConsumption = getStockConsumption;
exports.getStockConsumptionAverage = getStockConsumptionAverage;
exports.getInventoryQuantityAndConsumption = getInventoryQuantityAndConsumption;
exports.getInventoryMovements = getInventoryMovements;

/**
 * @function getLots
 *
 * @description returns a list of lots
 *
 * @param {string} sql - An optional sql script of selecting in lot
 * @param {object} params - A request query object
 * @param {string} finalClause - An optional final clause (GROUP BY, HAVING, ...) to add to query built
 */
function getLots(sqlQuery, parameters, finalClauseParameter) {
  const finalClause = finalClauseParameter;
  const params = parameters;  
  const sql = sqlQuery || `
        SELECT 
          BUID(l.uuid) AS uuid, l.label, l.initial_quantity, l.unit_cost, BUID(l.origin_uuid) AS origin_uuid,
          l.expiration_date, BUID(l.inventory_uuid) AS inventory_uuid, i.delay, l.entry_date,
          i.code, i.text, BUID(m.depot_uuid) AS depot_uuid, d.text AS depot_text, iu.text AS unit_type 
        FROM lot l 
        JOIN inventory i ON i.uuid = l.inventory_uuid 
        JOIN inventory_unit iu ON iu.id = i.unit_id 
        JOIN stock_movement m ON m.lot_uuid = l.uuid AND m.flux_id = ${flux.FROM_PURCHASE} 
        JOIN depot d ON d.uuid = m.depot_uuid 
    `;
  db.convert(params, ['uuid', 'depot_uuid', 'lot_uuid', 'inventory_uuid', 'document_uuid', 'entity_uuid']);
  const filters = new FilterParser(params, { autoParseStatements : false });

  filters.equals('uuid', 'uuid', 'l');
  filters.equals('depot_text', 'text', 'd');
  filters.equals('depot_uuid', 'depot_uuid', 'm');
  filters.equals('entity_uuid', 'entity_uuid', 'm');
  filters.equals('document_uuid', 'document_uuid', 'm');
  filters.equals('lot_uuid', 'lot_uuid', 'm');
  filters.equals('inventory_uuid', 'uuid', 'i');
  filters.equals('text', 'text', 'i');
  filters.equals('label', 'label', 'l');
  filters.equals('is_exit', 'is_exit', 'm');

  filters.period('defaultPeriod', 'date');
  filters.period('defaultPeriodEntry', 'entry_date', 'l');
  filters.period('period', 'entry_date');

  filters.dateFrom('expiration_date_from', 'expiration_date', 'l');
  filters.dateTo('expiration_date_to', 'expiration_date', 'l');

  filters.dateFrom('entry_date_from', 'entry_date', 'l');
  filters.dateTo('entry_date_to', 'entry_date', 'l');

  filters.dateFrom('dateFrom', 'date', 'm');
  filters.dateTo('dateTo', 'date', 'm');

  // If finalClause is an empty string, filterParser will not group, it will be an empty string
  filters.setGroup(finalClause || '');

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
function getLotsDepot(depotUuid, params, finalClause) {
  let status;
  // token of query to add if only no empty lots should be returned
  let exludeToken = '';

  if (depotUuid) {
    params.depot_uuid = depotUuid;
  }

  if (params.status) {
    status = params.status;
    delete params.status;
  }

  if(Number(params.includeEmptyLot) === 0){
    exludeToken = 'HAVING quantity > 0';
    delete params.includeEmptyLot;
  }

  const sql = `
        SELECT BUID(l.uuid) AS uuid, l.label, l.initial_quantity, 
            SUM(m.quantity * IF(m.is_exit = 1, -1, 1)) AS quantity, 
            d.text AS depot_text, l.unit_cost, l.expiration_date, 
            BUID(l.inventory_uuid) AS inventory_uuid, BUID(l.origin_uuid) AS origin_uuid, 
            l.entry_date, i.code, i.text, BUID(m.depot_uuid) AS depot_uuid,
            i.avg_consumption, i.purchase_interval, i.delay,
            iu.text AS unit_type
        FROM stock_movement m 
        JOIN lot l ON l.uuid = m.lot_uuid
        JOIN inventory i ON i.uuid = l.inventory_uuid
        JOIN inventory_unit iu ON iu.id = i.unit_id 
        JOIN depot d ON d.uuid = m.depot_uuid 
    `;

  const clause = finalClause || ` GROUP BY l.uuid, m.depot_uuid ${exludeToken}`;

  return getLots(sql, params, clause)
        .then(stockManagementProcess)
        .then((rows) => {
          if (status) {
            return rows.filter((row) => {
              return row.status === status;
            });
          }
          return rows;
        });
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
function getLotsMovements(depotUuid, params) {
  let finalClause;

  if (depotUuid) {
    params.depot_uuid = depotUuid;
  }

  if(params.groupByDocument === 1){
    finalClause = 'GROUP BY document_uuid';
    delete params.groupByDocument;
  }

  const sql = `
        SELECT 
          BUID(l.uuid) AS uuid, l.label, l.initial_quantity, m.quantity, m.reference, m.description, 
          d.text AS depot_text, IF(is_exit = 1, "OUT", "IN") AS io, l.unit_cost,
          l.expiration_date, BUID(l.inventory_uuid) AS inventory_uuid,
          BUID(l.origin_uuid) AS origin_uuid, l.entry_date, i.code, i.text,
          BUID(m.depot_uuid) AS depot_uuid, m.is_exit, m.date, BUID(m.document_uuid) AS document_uuid,
          m.flux_id, BUID(m.entity_uuid) AS entity_uuid, m.unit_cost, 
          f.label AS flux_label, i.delay,
          iu.text AS unit_type
        FROM stock_movement m 
        JOIN lot l ON l.uuid = m.lot_uuid
        JOIN inventory i ON i.uuid = l.inventory_uuid 
        JOIN inventory_unit iu ON iu.id = i.unit_id 
        JOIN depot d ON d.uuid = m.depot_uuid 
        JOIN flux f ON f.id = m.flux_id  
    `;

  return getLots(sql, params, finalClause);
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
function getLotsOrigins(depotUuid, params) {
  if (depotUuid) {
    params.depot_uuid = depotUuid;
  }

  const sql = `
        SELECT BUID(l.uuid) AS uuid, l.label, l.unit_cost, l.expiration_date, 
            BUID(l.inventory_uuid) AS inventory_uuid, BUID(l.origin_uuid) AS origin_uuid, 
            l.entry_date, i.code, i.text, origin.display_name, origin.reference, 
            BUID(m.document_uuid) AS document_uuid, m.flux_id,
            iu.text AS unit_type
        FROM lot l 
        JOIN inventory i ON i.uuid = l.inventory_uuid 
        JOIN inventory_unit iu ON iu.id = i.unit_id 
        JOIN (
          SELECT 
            p.uuid, CONCAT_WS('.', '${identifiers.PURCHASE_ORDER.key}', proj.abbr, p.reference) AS reference,
            'STOCK.PURCHASE_ORDER' AS display_name
          FROM 
            purchase p JOIN project proj ON proj.id = p.project_id
          UNION 
          SELECT 
            d.uuid, CONCAT_WS('.', '${identifiers.DONATION.key}', proj.abbr, d.reference) AS reference,
            'STOCK.DONATION' AS display_name 
            FROM 
              donation d JOIN project proj ON proj.id = d.project_id
          UNION 
          SELECT 
            i.uuid, CONCAT_WS('.', '${identifiers.INTEGRATION.key}', proj.abbr, i.reference) AS reference,
            'STOCK.INTEGRATION' AS display_name 
            FROM 
              integration i JOIN project proj ON proj.id = i.project_id 
        ) AS origin ON origin.uuid = l.origin_uuid 
        JOIN stock_movement m ON m.lot_uuid = l.uuid AND m.is_exit = 0 
          AND m.flux_id IN (${flux.FROM_PURCHASE}, ${flux.FROM_DONATION}, ${flux.FROM_INTEGRATION})
    `;

  return getLots(sql, params);
}

/**
 * Stock Management Processing
 */
function stockManagementProcess(inventories, inventoryDelay, purchaseInterval) {
  const current = moment();
  let CM;
  let Q;
  let delay;

  return inventories.map((inventory) => {
    Q = inventory.quantity; // the quantity
    CM = inventory.avg_consumption; // consommation mensuelle
    inventory.S_SEC = CM * (inventoryDelay || inventory.delay); // stock de securite
    inventory.S_MIN = inventory.S_SEC * 2; // stock minimum
    inventory.S_MAX = (CM * (purchaseInterval || inventory.purchase_interval)) + inventory.S_MIN; // stock maximum
    inventory.S_MONTH = Math.floor(inventory.quantity / CM); // mois de stock
    inventory.S_Q = inventory.S_MAX - inventory.quantity; // Commande d'approvisionnement
    inventory.S_Q = inventory.S_Q > 0 ? inventory.S_Q : 0;
    // todo: risque a perime (RP) = Stock - (Mois avant expiration * CM) // it is relatives to lots

    if (Q <= 0) {
      inventory.status = 'sold_out';
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

    delay = moment(new Date(inventory.expiration_date)).diff(current, 'months');
    inventory.S_RP = inventory.quantity - (delay * inventory.avg_consumption);

    delay = moment(new Date(inventory.expiration_date)).diff(current);
    inventory.delay_expiration = moment.duration(delay).humanize();
    return inventory;
  });
}

/**
 * @function getStockConsumption
 *
 * @description returns the monthly (periodic) stock consumption (CM)
 *
 * @param {array} periodIds
 */
function getStockConsumption(periodIds) {
  const sql = `
    SELECT SUM(s.quantity) AS quantity, BUID(i.uuid) AS uuid, i.text, i.code, d.text
    FROM stock_consumption s
    JOIN inventory i ON i.uuid = s.inventory_uuid 
    JOIN depot d ON d.uuid = s.depot_uuid
    JOIN period p ON p.id = s.period_id
    WHERE p.id IN (?) 
    GROUP BY i.uuid, d.uuid
  `;
  return db.exec(sql, [periodIds]);
}

/**
 * @function getStockConsumptionAverage
 *
 * @description returns average of stock consumption (CMM)
 *
 * @param {number} periodId - the base period
 *
 * @param {number} periodDate - a date for finding the correspondant period
 *
 * @param {number} numberOfMonths - the number of months for calculating the average
 */
function getStockConsumptionAverage(periodId, periodDate, numberOfMonths) {
  const baseAvgNumberOfMonths = numberOfMonths || BASE_NUMBER_OF_MONTHS;

  const baseDate = periodDate ? moment(periodDate).format(DATE_FORMAT) : moment().format(DATE_FORMAT);

  const queryPeriodRange = `
    SELECT id FROM period WHERE id BETWEEN ? AND ?;
  `;

  const queryPeriodId = periodId ?
    'SELECT id FROM period WHERE id = ? LIMIT 1;' :
    'SELECT id FROM period WHERE DATE(?) BETWEEN DATE(start_date) AND DATE(end_date) LIMIT 1;';

  const queryStockConsumption = `
    SELECT ROUND(AVG(s.quantity)) AS quantity, BUID(i.uuid) AS uuid, i.text, i.code, BUID(d.uuid) AS depot_uuid, d.text AS depot_text
    FROM stock_consumption s
    JOIN inventory i ON i.uuid = s.inventory_uuid 
    JOIN depot d ON d.uuid = s.depot_uuid
    JOIN period p ON p.id = s.period_id
    WHERE p.id IN (?) 
    GROUP BY i.uuid, d.uuid
  `;

  return db.one(queryPeriodId, [periodId || baseDate])
    .then((period) => {
      const beginingPeriod = period.id - baseAvgNumberOfMonths;
      const paramPeriodRange = beginingPeriod > 0 ? [beginingPeriod + 1, period.id] : [1, period.id];
      return db.exec(queryPeriodRange, paramPeriodRange);
    })
    .then((rows) => {
      const ids = rows.map(row => row.id);

      return db.exec(queryStockConsumption, [ids]);
    });
}

/**
 * Inventory Quantity and Consumptions
 */
function getInventoryQuantityAndConsumption(params) {
  const bundle = {};
  let status;
  let delay;
  let purchaseInterval;

  if (params.status) {
    status = params.status;
    delete params.status;
  }

  if (params.inventory_delay) {
    delay = params.inventory_delay;
    delete params.inventory_delay;
  }

  if (params.purchase_interval) {
    purchaseInterval = params.purchase_interval;
    delete params.purchase_interval;
  }

  const sql = `
    SELECT BUID(l.uuid) AS uuid, l.label, l.initial_quantity, 
        SUM(m.quantity * IF(m.is_exit = 1, -1, 1)) AS quantity, 
        d.text AS depot_text, l.unit_cost, l.expiration_date, 
        BUID(l.inventory_uuid) AS inventory_uuid, BUID(l.origin_uuid) AS origin_uuid, 
        l.entry_date, i.code, i.text, BUID(m.depot_uuid) AS depot_uuid,
        i.avg_consumption, i.purchase_interval, i.delay,
        iu.text AS unit_type
    FROM stock_movement m 
    JOIN lot l ON l.uuid = m.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN inventory_unit iu ON iu.id = i.unit_id 
    JOIN depot d ON d.uuid = m.depot_uuid 
  `;

  const clause = ' GROUP BY l.inventory_uuid, m.depot_uuid ';

  return getLots(sql, params, clause)
    .then((rows) => {
      bundle.inventories = rows;
      return getStockConsumptionAverage(null, params.dateTo);
    })
    .then((rows) => {
      var sameInventory;
      var sameDepot;

      bundle.consumptions = rows;

      for (let i = 0; i < bundle.consumptions.length; i++) {
        for (let j = 0; j < bundle.inventories.length; j++) {
          sameInventory = bundle.consumptions[i].uuid === bundle.inventories[j].inventory_uuid;
          sameDepot = bundle.consumptions[i].depot_uuid === bundle.inventories[j].depot_uuid;
          if (sameInventory && sameDepot) {
            bundle.inventories[j].avg_consumption = bundle.consumptions[i].quantity;
            break;
          }
        }
      }

      return bundle.inventories;
    })
    .then((inventories) => stockManagementProcess(inventories, delay, purchaseInterval))
    .then((rows) => {
      if (status) {
        return rows.filter(row => row.status === status);
      }
      return rows;
    });
}

/**
 * Inventory Movement Report
 */
function getInventoryMovements(params) {
  const bundle = {};

  const sql = `
    SELECT BUID(l.uuid) AS uuid, l.label, l.initial_quantity,
        d.text AS depot_text, l.unit_cost, l.expiration_date,
        m.quantity, m.is_exit, m.date,
        BUID(l.inventory_uuid) AS inventory_uuid, BUID(l.origin_uuid) AS origin_uuid, 
        l.entry_date, i.code, i.text, BUID(m.depot_uuid) AS depot_uuid,
        i.avg_consumption, i.purchase_interval, i.delay, iu.text AS unit_type
    FROM stock_movement m 
    JOIN lot l ON l.uuid = m.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN inventory_unit iu ON iu.id = i.unit_id 
    JOIN depot d ON d.uuid = m.depot_uuid 
  `;

  return getLots(sql, params, ' ORDER BY m.date ASC ')
    .then((rows) => {
      bundle.movements = rows;

      // build the inventory report
      let stockQuantity = 0;
      let stockUnitCost = 0;
      let stockValue = 0;

      // stock method CUMP : cout unitaire moyen pondere
      const movements = bundle.movements.map((line) => {
        const movement = {
          date : line.date,
          entry : { quantity : 0, unit_cost : 0, value : 0 },
          exit : { quantity : 0, unit_cost : 0, value : 0 },
          stock : { quantity : 0, unit_cost : 0, value : 0 },
        };

        if (line.is_exit) {
          stockQuantity -= line.quantity;
          stockValue = stockQuantity * stockUnitCost;

          // exit
          movement.exit.quantity = line.quantity;
          movement.exit.unit_cost = stockUnitCost;
          movement.exit.value = line.quantity * line.unit_cost;

          // stock status
          movement.stock.quantity = stockQuantity;
          movement.stock.unit_cost = stockUnitCost;
          movement.stock.value = stockValue;
        } else {
          const newQuantity = line.quantity + stockQuantity;
          const newValue = (line.unit_cost * line.quantity) + stockValue;
          const newCost = newValue / newQuantity;

          stockQuantity = newQuantity;
          stockUnitCost = newCost;
          stockValue = newValue;

          // entry
          movement.entry.quantity = line.quantity;
          movement.entry.unit_cost = line.unit_cost;
          movement.entry.value = line.quantity * line.unit_cost;

          // stock status
          movement.stock.quantity = stockQuantity;
          movement.stock.unit_cost = stockUnitCost;
          movement.stock.value = stockValue;
        }
        return movement;
      });

      // totals of quantities
      const totals = movements.reduce((total, line) => {
        total.entry += line.entry.quantity;
        total.exit += line.exit.quantity;
        return total;
      }, { entry : 0, exit : 0 });

      // stock value
      const result = movements.length ? movements[movements.length - 1] : {};

      return { movements, totals, result };
    });
}
