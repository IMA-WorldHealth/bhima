/**
 * @module stock/core
 *
 * @description
 * This module is responsible for handling all function utility for stock
 *
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

// exports
exports.flux = flux;
exports.getLots = getLots;
exports.getLotsDepot = getLotsDepot;
exports.getLotsMovements = getLotsMovements;
exports.getLotsOrigins = getLotsOrigins;

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
        SELECT BUID(l.uuid) AS uuid, l.label, l.initial_quantity, l.unit_cost, BUID(l.origin_uuid) AS origin_uuid,
            l.expiration_date, BUID(l.inventory_uuid) AS inventory_uuid,
            i.delay, l.entry_date, i.code, i.text, BUID(m.depot_uuid) AS depot_uuid, d.text AS depot_text,
            iu.text AS unit_type 
        FROM lot l 
        JOIN inventory i ON i.uuid = l.inventory_uuid 
        JOIN inventory_unit iu ON iu.id = i.unit_id 
        JOIN stock_movement m ON m.lot_uuid = l.uuid AND m.flux_id = ${flux.FROM_PURCHASE} 
        JOIN depot d ON d.uuid = m.depot_uuid 
    `;

  const filters = new FilterParser(params, {autoParseStatements : false });

  filters.equals('uuid', 'uuid', 'l');
  filters.equals('depot_text', 'text', 'd');
  filters.equals('depot_uuid', 'uuid', 'd');
  filters.equals('inventory_uuid', 'uuid', 'i');
  filters.equals('text', 'text', 'i');
  filters.equals('label', 'label', 'l');

  filters.period('defaultPeriod', 'date');
  filters.period('period', 'date');
  
  filters.dateFrom('expiration_date_from', 'expiration_date', 'l');
  filters.dateTo('expiration_date_to', 'expiration_date', 'l');

  filters.dateFrom('entry_date_from', 'entry_date', 'l');
  filters.dateTo('entry_date_to', 'entry_date', 'l');

  filters.dateFrom('dateFrom', 'date', 'm');
  filters.dateTo('dateTo', 'date', 'm');
  filters.setGroup(finalClause || '');
  console.log('params', params);

  let query = filters.applyQuery(sql);
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
    console.log('params depot : ',depotUuid, 'params : ', params, 'finalclause : ', finalClause);

  if (depotUuid) {
    params.depot_uuid = depotUuid;
  }

  if (params.status) {
    status = params.status;
    delete params.status;
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

  const clause = finalClause || ' GROUP BY l.uuid, m.depot_uuid ';

  return getLots(sql, params, clause)
        .then(stockManagementProcess)
        .then((rows) => {
          if (status) {
            return rows.filter((row) => {
              return row.status === status;
            });
          }
          return rows;
        })
        .catch(function(err){console.log(err)});
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
  if (depotUuid) {
    params.depot_uuid = depotUuid;
  }

  const sql = `
        SELECT BUID(l.uuid) AS uuid, l.label, l.initial_quantity, m.quantity, d.text AS depot_text, 
          IF(is_exit = 1, "OUT", "IN") AS io, l.unit_cost, l.expiration_date, 
          BUID(l.inventory_uuid) AS inventory_uuid, BUID(l.origin_uuid) AS origin_uuid, 
          l.entry_date, i.code, i.text, BUID(m.depot_uuid) AS depot_uuid, m.is_exit, m.date,
          BUID(m.document_uuid) AS document_uuid, m.flux_id, BUID(m.entity_uuid) AS entity_uuid, m.unit_cost, 
          f.label AS flux_label, i.delay,
          iu.text AS unit_type
        FROM stock_movement m 
        JOIN lot l ON l.uuid = m.lot_uuid
        JOIN inventory i ON i.uuid = l.inventory_uuid 
        JOIN inventory_unit iu ON iu.id = i.unit_id 
        JOIN depot d ON d.uuid = m.depot_uuid 
        JOIN flux f ON f.id = m.flux_id  
    `;

  return getLots(sql, params);
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
function stockManagementProcess(inventories) {
  const current = moment();
  let CM;
  let Q;
  let delay;

  return inventories.map((inventory) => {
    Q = inventory.quantity; // the quantity
    CM = inventory.avg_consumption; // consommation mensuelle
    inventory.S_SEC = CM * inventory.delay; // stock de securite
    inventory.S_MIN = inventory.S_SEC * 2; // stock minimum
    inventory.S_MAX = (CM * inventory.purchase_interval) + inventory.S_MIN; // stock maximum
    inventory.S_MONTH = inventory.quantity / CM; // mois de stock
    inventory.S_Q = inventory.S_MAX - inventory.quantity; // Commande d'approvisionnement
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
