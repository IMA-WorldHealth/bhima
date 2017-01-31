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
exports.createStock = createStock;
exports.createMovement = createMovement;


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
