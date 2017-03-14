/**
 * @module stock/core
 *
 * @description
 * This module is responsible for handling all function utility for stock
 *
 * @requires lodash
 * @requires util
 * @requires lib/db
 *
 */

'use strict';

const _ = require('lodash');
const moment = require('moment');
const util = require('../../lib/util');
const db = require('../../lib/db');
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
};

// exports
exports.flux = flux;
exports.getLots = getLots;
exports.getLotsDepot = getLotsDepot;
exports.getLotsMovements = getLotsMovements;

/**
 * @function getLots
 *
 * @description returns a list of lots
 *
 * @param {string} sql - An optional sql script of selecting in lot
 * @param {object} params - A request query object
 * @param {string} finalClause - An optional final clause (GROUP BY, HAVING, ...) to add to query built
 */
function getLots(sqlParameter, parameters, finalClauseParameter) {
  let finalClause = finalClauseParameter;
  const params = parameters;
  const sql = sqlParameter || `
        SELECT BUID(l.uuid) AS uuid, l.label, l.initial_quantity, l.unit_cost,
            l.expiration_date, BUID(l.inventory_uuid) AS inventory_uuid, BUID(l.purchase_uuid) AS purchase_uuid, 
            i.delay, l.entry_date, i.code, i.text, BUID(m.depot_uuid) AS depot_uuid, d.text AS depot_text,
            CONCAT_WS('.', '${identifiers.PURCHASE_ORDER.key}', proj.abbr, p.reference) AS purchase_reference
        FROM lot l 
        JOIN inventory i ON i.uuid = l.inventory_uuid 
        JOIN purchase p ON p.uuid = l.purchase_uuid
        JOIN project proj ON proj.id = p.project_id
        JOIN stock_movement m ON m.lot_uuid = l.uuid AND m.flux_id = ${flux.FROM_PURCHASE} 
        JOIN depot d ON d.uuid = m.depot_uuid 
    `;

  let queryExpiration;
  let paramExpiration;
  let queryEntry;
  let paramEntry;
  const queryArray = [];
  const paramArray = [];

  if (params.uuid) {
    params['l.uuid'] = params.uuid;
    delete params.uuid;
  }

  if (params.depot_text) {
    params['d.text'] = params.depot_text;
    delete params.depot_text;
  }

  if (params.text) {
    params['i.text'] = params.text;
    delete params.text;
  }

  if (params.label) {
    params['l.label'] = params.label;
    delete params.label;
  }

  if (params.purchase_reference) {
    const havingReference = ` HAVING purchase_reference LIKE "${params.purchase_reference}" `;
    finalClause = finalClause ? finalClause + havingReference : havingReference;
    delete params.purchase_reference;
  }

  if (params.expiration_date_from && params.expiration_date_to) {
    queryExpiration = ` DATE(l.expiration_date) BETWEEN DATE(?) AND DATE(?) `;
    paramExpiration = [
      util.dateString(params.expiration_date_from),
      util.dateString(params.expiration_date_to),
    ];

    queryArray.push(queryExpiration);
    paramArray.push(paramExpiration);

    delete params.expiration_date_from;
    delete params.expiration_date_to;
  } else if (params.expiration_date_from && !params.expiration_date_to) {
    queryExpiration = ` DATE(l.expiration_date) >= DATE(?) `;
    paramExpiration = [
      util.dateString(params.expiration_date_from),
    ];

    queryArray.push(queryExpiration);
    paramArray.push(paramExpiration);

    delete params.expiration_date_from;
  } else if (!params.expiration_date_from && params.expiration_date_to) {
    queryExpiration = ` DATE(l.expiration_date) <= DATE(?) `;
    paramExpiration = [
      util.dateString(params.expiration_date_to),
    ];

    queryArray.push(queryExpiration);
    paramArray.push(paramExpiration);

    delete params.expiration_date_to;
  }

  if (params.entry_date_from && params.entry_date_to) {
    queryEntry = ` DATE(l.entry_date) BETWEEN DATE(?) AND DATE(?) `;
    paramEntry = [
      util.dateString(params.entry_date_from),
      util.dateString(params.entry_date_to),
    ];

    queryArray.push(queryEntry);
    paramArray.push(paramEntry);

    delete params.entry_date_from;
    delete params.entry_date_to;
  } else if (params.entry_date_from && !params.entry_date_to) {
    queryEntry = ` DATE(l.entry_date) >= DATE(?) `;
    paramEntry = [
      util.dateString(params.entry_date_from),
    ];

    queryArray.push(queryEntry);
    paramArray.push(paramEntry);

    delete params.entry_date_from;
  } else if (!params.entry_date_from && params.entry_date_to) {
    queryEntry = ` DATE(l.entry_date) <= DATE(?) `;
    paramEntry = [
      util.dateString(params.entry_date_to),
    ];

    queryArray.push(queryEntry);
    paramArray.push(paramEntry);

    delete params.entry_date_to;
  }

  if (params.dateFrom && params.dateTo) {
    queryExpiration = ` DATE(m.date) BETWEEN DATE(?) AND DATE(?) `;
    paramExpiration = [
      util.dateString(params.dateFrom),
      util.dateString(params.dateTo),
    ];

    queryArray.push(queryExpiration);
    paramArray.push(paramExpiration);

    delete params.dateFrom;
    delete params.dateTo;
  } else if (params.dateFrom && !params.dateTo) {
    queryExpiration = ` DATE(m.date) >= DATE(?) `;
    paramExpiration = [
      util.dateString(params.dateFrom),
    ];

    queryArray.push(queryExpiration);
    paramArray.push(paramExpiration);

    delete params.dateFrom;
  } else if (!params.dateFrom && params.dateTo) {
    queryExpiration = ` DATE(m.date) <= DATE(?) `;
    paramExpiration = [
      util.dateString(params.dateTo),
    ];

    queryArray.push(queryExpiration);
    paramArray.push(paramExpiration);

    delete params.dateTo;
  }

    // build query and parameters correctly
  const builder = util.queryCondition(sql, params);

    // dates queries and parameters
  const hasOtherParams = (Object.keys(params).length > 0);

  if (paramArray.length) {
    builder.query += hasOtherParams ? ' AND ' + queryArray.join(' AND ') : ' WHERE ' + queryArray.join(' AND ');
    builder.conditions = _.concat(builder.conditions, paramArray);
    builder.conditions = _.flattenDeep(builder.conditions);
  }

    // finalize the query
  builder.query += finalClause || '';

  return db.exec(builder.query, builder.conditions);
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
function getLotsDepot(depot_uuid, params, finalClause) {
  let status;

  if (depot_uuid) {
    params.depot_uuid = depot_uuid;
  }

  if (params.status) {
    status = params.status;
    delete params.status;
  }

  const sql = `
        SELECT BUID(l.uuid) AS uuid, l.label, l.initial_quantity, 
            SUM(m.quantity * IF(m.is_exit = 1, -1, 1)) AS quantity, d.text AS depot_text,
            l.unit_cost, l.expiration_date, BUID(l.inventory_uuid) AS inventory_uuid, BUID(l.purchase_uuid) AS purchase_uuid, 
            l.entry_date, i.code, i.text, BUID(m.depot_uuid) AS depot_uuid,
            i.avg_consumption, i.purchase_interval, i.delay,
            CONCAT_WS('.', '${identifiers.PURCHASE_ORDER.key}', proj.abbr, p.reference) AS purchase_reference 
        FROM stock_movement m 
        JOIN lot l ON l.uuid = m.lot_uuid
        JOIN purchase p ON p.uuid = l.purchase_uuid
        JOIN project proj ON proj.id = p.project_id
        JOIN inventory i ON i.uuid = l.inventory_uuid
        JOIN depot d ON d.uuid = m.depot_uuid 
    `;

  finalClause = finalClause || ` GROUP BY l.uuid, m.depot_uuid `;

  return getLots(sql, params, finalClause)
        .then(stockManagementProcess)
        .then(rows => {
          if (status) {
            return rows.filter(row => {
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
function getLotsMovements(depot_uuid, params) {
  if (depot_uuid) {
    params.depot_uuid = depot_uuid;
  }

  const sql = `
        SELECT BUID(l.uuid) AS uuid, l.label, l.initial_quantity, m.quantity, d.text AS depot_text, IF(is_exit = 1, "OUT", "IN") AS io,
            l.unit_cost, l.expiration_date, BUID(l.inventory_uuid) AS inventory_uuid, BUID(l.purchase_uuid) AS purchase_uuid, 
            l.entry_date, i.code, i.text, BUID(m.depot_uuid) AS depot_uuid, 
            m.is_exit, m.date, BUID(m.document_uuid) AS document_uuid, m.flux_id, BUID(m.entity_uuid) AS entity_uuid, m.unit_cost, 
            f.label AS flux_label, i.delay,
            CONCAT_WS('.', '${identifiers.PURCHASE_ORDER.key}', proj.abbr, p.reference) AS purchase_reference      
        FROM stock_movement m 
        JOIN lot l ON l.uuid = m.lot_uuid
        JOIN purchase p ON p.uuid = l.purchase_uuid
        JOIN project proj ON proj.id = p.project_id
        JOIN inventory i ON i.uuid = l.inventory_uuid
        JOIN depot d ON d.uuid = m.depot_uuid 
        JOIN flux f ON f.id = m.flux_id  
    `;

  return getLots(sql, params);
}

/**
 * Stock Management Processing
 */
function stockManagementProcess(inventories) {
  const current = moment();
  let CM, Q;
  let delay;

  return inventories.map(inventory => {
    Q = inventory.quantity; // the quantity
    CM = inventory.avg_consumption; // consommation mensuelle
    inventory.S_SEC = CM * inventory.delay; // stock de securite
    inventory.S_MIN = inventory.S_SEC * 2; // stock minimum
    inventory.S_MAX = CM * inventory.purchase_interval + inventory.S_MIN; // stock maximum
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
