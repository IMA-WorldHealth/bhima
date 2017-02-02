/**
 * @module stock/
 *
 * @description
 * The /stock HTTP API endpoint
 *
 * @description
 * This module is responsible for handling all crud operations relatives to stocks
 * and define all stock API functions 
 *
 *
 * @requires q
 * @requires lodash
 * @requires lib/node-uuid
 * @requires util
 * @requires lib/db
 * @requires lib/topic
 * @requires lib/node-uuid
 * @requires lib/errors/BadRequest
 * @requires lib/errors/NotFound
 *
 */

'use strict';

const _      = require('lodash');
const q      = require('q');
const uuid   = require('node-uuid');
const moment = require('moment');

const util   = require('../../lib/util');
const db     = require('../../lib/db');
const topic  = require('../../lib/topic');

const BadRequest  = require('../../lib/errors/BadRequest');
const NotFound    = require('../../lib/errors/NotFound');

const flux = {
    'FROM_PURCHASE'    : 1,
    'FROM_OTHER_DEPOT' : 2,
    'FROM_ADJUSTMENT'  : 3,
    'FROM_PATIENT'     : 4,
    'FROM_SERVICE'     : 5,
    'FROM_DONATION'    : 6,
    'FROM_LOSS'        : 7,
    'TO_OTHER_DEPOT'   : 8,
    'TO_PATIENT'       : 9,
    'TO_SERVICE'       : 10,
    'TO_LOSS'          : 11,
    'TO_ADJUSTMENT'    : 12
};


// expose to the API 
exports.createStock        = createStock;
exports.createMovement     = createMovement;
exports.listLots           = listLots;
exports.listLotsDepot      = listLotsDepot;
exports.listInventoryDepot = listInventoryDepot;
exports.listLotsMovements  = listLotsMovements;


/**
 * POST /stock/lots
 * Create a new stock lots entry
 */
function createStock(req, res, next) {
    let params = req.body;

    let createLotQuery, createLotObject, createMovementQuery, createMovementObject, date;

    const transaction  = db.transaction();

    const document = {
        uuid: uuid.v4(),
        date: moment(new Date(params.date)).format('YYYY-MM-DD').toString(),
        user: req.session.user.id
    };

    params.lots.forEach(lot => {

        // lot expiration date 
        date = moment(new Date(lot.expiration_date)).format('YYYY-MM-DD').toString();

        // lot prepare query
        createLotQuery = `INSERT INTO lot SET ?`;
        createLotObject = {
            uuid:             db.bid(uuid.v4()),
            label:            lot.label,
            initial_quantity: lot.quantity,
            quantity:         lot.quantity,
            unit_cost:        lot.unit_cost,
            expiration_date:  date,
            inventory_uuid:   db.bid(lot.inventory_uuid),
            purchase_uuid:    db.bid(lot.purchase_uuid),
            delay:            0
        };

        // entering movement prepare query 
        createMovementQuery = `INSERT INTO stock_movement SET ?`;
        createMovementObject = {
            uuid:             db.bid(uuid.v4()),
            lot_uuid:         createLotObject.uuid,
            depot_uuid:       db.bid(params.depot_uuid),
            document_uuid:    db.bid(document.uuid),
            flux_id:          params.flux_id,
            date:             document.date,
            quantity:         lot.quantity,
            unit_cost:        lot.unit_cost,
            is_exit:          0,
            user_id:          document.user
        };

        // transaction - add lot 
        transaction.addQuery(createLotQuery, [createLotObject]);

        // transaction - add movement 
        transaction.addQuery(createMovementQuery, [createMovementObject]);
    });

    transaction.execute()
    .then(() => {
        res.status(201).json({ uuid: document.uuid });
    })
    .catch(next)
    .done();
}

/**
 * POST /stock/movement
 * Create a new stock movement 
 */
function createMovement(req, res, next) {
    let params = req.body;

    const document = {
        uuid: uuid.v4(),
        date: moment(new Date(params.date)).format('YYYY-MM-DD').toString(),
        user: req.session.user.id
    };

    let process = (params.from_depot && params.to_depot) ? depotMovement : normalMovement;

    process(document, params)
    .then(rows => {
        res.status(201).json({ uuid: document.uuid });
    })
    .catch(next)
    .done();
}

/**
 * @function normalMovement
 * @description there are only lines for IN or OUT
 */
function normalMovement(document, params) {
    let createMovementQuery, createMovementObject;

    const transaction  = db.transaction();

    params.entity_uuid = params.entity_uuid ? db.bid(params.entity_uuid) : null;

    params.lots.forEach(lot => {
        createMovementQuery = `INSERT INTO stock_movement SET ?`;
        createMovementObject = {
            uuid:             db.bid(uuid.v4()),
            lot_uuid:         db.bid(lot.uuid),
            depot_uuid:       db.bid(params.depot_uuid),
            document_uuid:    db.bid(document.uuid),
            quantity:         lot.quantity,
            unit_cost:        lot.unit_cost,
            date:             document.date,
            entity_uuid:      params.entity_uuid,
            is_exit:          params.is_exit,
            flux_id:          params.flux_id,
            user_id:          document.user
        };

        // transaction - add movement 
        transaction.addQuery(createMovementQuery, [createMovementObject]);
    });

    return transaction.execute();
}

/**
 * @function depotMovement
 * @description movement between depots, there are two lines for IN and OUT
 */
function depotMovement(document, params) {

    let paramIn, paramOut;

    const transaction  = db.transaction();

    params.enity_uuid = params.enity_uuid ? db.bid(params.enity_uuid) : null;

    params.lots.forEach(lot => {

        // OUT: 
        paramOut = {
            uuid:             db.bid(uuid.v4()),
            lot_uuid:         db.bid(lot.uuid),
            depot_uuid:       db.bid(params.from_depot),
            document_uuid:    db.bid(document.uuid),
            quantity:         lot.quantity,
            unit_cost:        lot.unit_cost,
            date:             document.date,
            entity_uuid:      null,
            is_exit:          1,
            flux_id:          flux.TO_OTHER_DEPOT,
            user_id:          document.user
        };

        // IN: 
        paramIn = {
            uuid:             db.bid(uuid.v4()),
            lot_uuid:         db.bid(lot.uuid),
            depot_uuid:       db.bid(params.to_depot),
            document_uuid:    db.bid(document.uuid),
            quantity:         lot.quantity,
            unit_cost:        lot.unit_cost,
            date:             document.date,
            entity_uuid:      null,
            is_exit:          0,
            flux_id:          flux.FROM_OTHER_DEPOT,
            user_id:          document.user
        };
        
        transaction.addQuery('INSERT INTO stock_movement SET ?', [paramOut]);
        transaction.addQuery('INSERT INTO stock_movement SET ?', [paramIn]);
    });

    return transaction.execute();
}

/**
 * @function getLots
 * 
 * @description returns a list of lots 
 * 
 * @param {string} sql - An optional sql script of selecting in lot
 * @param {object} params - A request query object 
 * @param {string} final_clause - An optional final clause (GROUP BY, HAVING, ...) to add to query built
 */
function getLots(sql, params, final_clause) {
    sql = sql || `
        SELECT BUID(l.uuid) AS uuid, l.label, l.initial_quantity, l.unit_cost,
            l.expiration_date, BUID(l.inventory_uuid) AS inventory_uuid, BUID(l.purchase_uuid) AS purchase_uuid, 
            l.delay, l.entry_date, i.code, i.text, BUID(m.depot_uuid) AS depot_uuid, d.text AS depot_text
        FROM lot l 
        JOIN inventory i ON i.uuid = l.inventory_uuid 
        JOIN stock_movement m ON m.lot_uuid = l.uuid AND m.flux_id = ${flux.FROM_PURCHASE} 
        JOIN depot d ON d.uuid = m.depot_uuid 
    `;

    let queryExpiration, paramExpiration, queryEntry, paramEntry, 
        queryArray = [], paramArray = [];

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
    }

    // build query and parameters correctly
    let builder = util.queryCondition(sql, params);

    // dates queries and parameters  
    let hasOtherParams = (Object.keys(params).length > 0);
    
    if (paramArray.length) {

        builder.query += hasOtherParams ? ' AND ' + queryArray.join(' AND ') : ' WHERE ' + queryArray.join(' AND ');
        builder.conditions = _.concat(builder.conditions, paramArray);
        builder.conditions = _.flattenDeep(builder.conditions);
    }

    // finalize the query 
    builder.query += final_clause || '';

    return db.exec(builder.query, builder.conditions);
}

/**
 * GET /stock/lots
 * this function helps to list lots 
 */
function listLots(req, res, next) {
    let params = req.query;
    
    getLots(null, params)
    .then(rows => {
        res.status(200).json(rows);
    })
    .catch(next)
    .done();
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
 * @param {string} final_clause - An optional final clause (GROUP BY, ...) to add to query built
 */
function getLotsDepot(depot_uuid, params, final_clause) {

    if (depot_uuid) {
        params.depot_uuid = depot_uuid;
    }

    const sql = `
        SELECT BUID(l.uuid) AS uuid, l.label, l.initial_quantity, 
            SUM(m.quantity * IF(m.is_exit = 1, -1, 1)) AS quantity, d.text AS depot_text,
            l.unit_cost, l.expiration_date, BUID(l.inventory_uuid) AS inventory_uuid, BUID(l.purchase_uuid) AS purchase_uuid, 
            l.delay, l.entry_date, i.code, i.text, BUID(m.depot_uuid) AS depot_uuid 
        FROM stock_movement m 
        JOIN lot l ON l.uuid = m.lot_uuid
        JOIN inventory i ON i.uuid = l.inventory_uuid
        JOIN depot d ON d.uuid = m.depot_uuid 
    `;

    final_clause = final_clause || ` GROUP BY l.uuid, m.depot_uuid `;

    return getLots(sql, params, final_clause);
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
            l.delay, l.entry_date, i.code, i.text, BUID(m.depot_uuid) AS depot_uuid, m.is_exit  
        FROM stock_movement m 
        JOIN lot l ON l.uuid = m.lot_uuid
        JOIN inventory i ON i.uuid = l.inventory_uuid
        JOIN depot d ON d.uuid = m.depot_uuid  
    `;

    return getLots(sql, params);
}

/**
 * GET /stock/lots/movements 
 * returns list of stock movements 
 */
function listLotsMovements(req, res, next) {
    let params = req.query;

    getLotsMovements(null, params)
    .then(rows => {
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
    let params = req.query;

    getLotsDepot(null, params)
    .then(rows => {
        res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
 * GET /stock/inventory/depots/
 * returns list of each inventory in a given depot with their quantities
 * @todo process stock alert, rupture of stock
 * @todo prevision for purchase 
 */
function listInventoryDepot(req, res, next) {
    let params = req.query;

    getLotsDepot(null, params, ' GROUP BY l.inventory_uuid, m.depot_uuid ')
    .then(rows => {
        res.status(200).json(rows);
    })
    .catch(next)
    .done();
}