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


// expose to the API 
exports.createNewStock = createNewStock;


/**
 * POST /stock/create
 * Create a new stock entry
 */
function createNewStock(req, res, next) {
    let params = req.query;

    let createLotQuery, createLotObject, createMovementQuery, createMovementObject;

    const transaction  = db.transaction();

    const documentUuid = uuid.v4();

    const documentDate = moment(new Date(params.date)).format('YYYY-MM-DD').toString();

    const documentUser = req.session.user.id;

    params.lots.forEach(lot => {

        // lot prepare query 
        createLotQuery = `INSERT INTO lot SET ?`;
        createLotObject = {
            uuid:             db.bid(uuid.v4()),
            label:            lot.label,
            initial_quantity: lot.quantity,
            quantity:         lot.quantity,
            unit_cost:        lot.unit_cost,
            expiration_date:  lot.expiration_date,
            inventory_uuid:   lot.inventory_uuid,
            purchase_uuid:    lot.purchase_uuid,
            delay:            0
        };

        // entering movement prepare query 
        createMovementQuery = `INSERT INTO stock_movement SET ?`;
        createMovementObject = {
            uuid:             db.bid(uuid.v4()),
            lot_uuid:         createLotObject.uuid,
            depot_uuid:       params.depot_uuid,
            document_uuid:    db.bid(documentUuid),
            flux_id:          params.flux_id,
            date:             documentDate,
            quantity:         lot.quantity,
            is_exit:          0,
            user_id:          documentUser
        };

        // transaction - add lot 
        transaction.addQuery(createLotQuery, [createLotObject]);

        // transaction - add movement 
        transaction.addQuery(createMovementQuery, [createMovementObject]);
    });

    transaction.execute()
    .then(() => {
        res.status(200).json({ uuid: documentUuid })
    })
    .catch(next)
    .done();
}
