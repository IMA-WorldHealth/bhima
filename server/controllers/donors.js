/**
* The Donors Controllers
*
* @module donors
*
* @desc This module is responsible for handling all crud operations relatives
* to donors management, and relatives functions
*
* @required q
* @required lib/db
*
*/

'use strict';

var q  = require('q'),
    db = require('../lib/db');

/** Create a new donor */
exports.create = create;

/** Update a donor */
exports.update = update;

/** Get donors list */
exports.list = list;

/** Get detail of a donor */
exports.detail = detail;

/** Delete a donor */
exports.remove = remove;

/**
 * POST /donors
 * @description Create a new donor
 */
function create(req, res, next) {
	var query = 'INSERT INTO donor SET ?';
	db.exec(query, [req.body])
	.then(function (rows){
		res.status(201).send({ id : rows.insertId });
	})
	.catch(next);
}

/**
 * PUT /donors/:id
 * @description Update an existing donor
 */
function update(req, res, next) {
	var query = 'UPDATE donor SET ? WHERE id = ?';
	db.exec(query, [req.body, req.params.id])
	.then(function (rows){
		return db.exec('SELECT id, name FROM donor WHERE id = ?', [req.params.id]);
	})
	.then(function (rows) {
		if (!rows.length) { return next(new req.codes.ERR_NOT_FOUND()); }
		res.status(200).send(rows[0]);
	})
	.catch(next);
}

/**
 * GET /donors
 * @description Get donors
 */
function list(req, res, next) {
	var query = 'SELECT id, name FROM donor';
	db.exec(query)
	.then(function (rows){
		res.status(200).send(rows);
	})
	.catch(next);
}

/**
 * GET /donors/:id
 * @description Get a specific donor
 */
function detail(req, res, next) {
	var query = 'SELECT id, name FROM donor WHERE id = ?';
	db.exec(query, [req.params.id])
	.then(function (rows){
		res.status(200).send(rows[0]);
	})
	.catch(next);
}

/**
 * DELETE /donors/:id
 * @description Delete a specific donor
 */
function remove(req, res, next) {
	var query = 'DELETE FROM donor WHERE id = ?';
	db.exec(query, [req.params.id])
	.then(function (){
		res.status(204).send();
	})
	.catch(next);
}
