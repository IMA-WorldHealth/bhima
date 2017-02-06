/**
 * @overview Services
 *
 * @description
 * The /services HTTP API endpoint
 *
 * @description
 * This controller is responsible for implementing all crud and others custom request
 * on the services table through the `/services` endpoint.
 *
 * @requires db
 * @requires NotFound
 * @requires BadRequest
 * @requires Topic
 */

'use strict';

const db = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');
const BadRequest = require('../../lib/errors/BadRequest');
const Topic = require('../../lib/topic');

/**
 * @method list
 *
 * @description
 * Returns an array of services from the database.
 */
function list(req, res, next) {
  let sql =
    'SELECT s.id, s.name, s.cost_center_id, s.profit_center_id FROM service AS s';

  if (req.query.full === '1') {
    sql = `
      SELECT s.id, s.name, s.enterprise_id, s.cost_center_id,
        s.profit_center_id, e.name AS enterprise_name, e.abbr, cc.id AS cc_id,
        cc.text AS cost_center_name, pc.id AS pc_id, pc.text AS profit_center_name
      FROM service AS s
      JOIN enterprise AS e ON s.enterprise_id = e.id
      LEFT JOIN cost_center AS cc ON s.cost_center_id = cc.id
      LEFT JOIN profit_center AS pc ON s.profit_center_id = pc.id`;
  }

  sql += ' ORDER BY s.name;';

  db.exec(sql)
    .then(function (rows) {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
 * @method create
 *
 * @description
 * Create a service in the database
 */
function create(req, res, next) {
  let record = req.body;
  let sql = 'INSERT INTO service SET ?';

  // add contextual information
  record.enterprise_id = req.session.enterprise.id;

  delete record.id;

  db.exec(sql, [record])
    .then(function (result) {

      Topic.publish(Topic.channels.ADMIN, {
        event: Topic.events.CREATE,
        entity: Topic.entities.SERVICE,
        user_id: req.session.user.id,
        id : result.insertId
      });

      res.status(201).json({ id: result.insertId });
    })
    .catch(next)
    .done();
}

/**
* Update a service in the database
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express object to pass the controle to the next middleware
*
* @example
* // PUT /services : update a service
* let services = require('admin/services');
* services.update(req, res, next);
*/


function update(req, res, next) {
  let queryData = req.body;
  let sql = 'UPDATE service SET ? WHERE id = ?;';

  delete queryData.id;

  db.exec(sql, [queryData, req.params.id])
    .then(function (result) {
      if (!result.affectedRows) {
        throw new NotFound(`Could not find a service with id ${req.params.id}.`);
      }

      return lookupService(req.params.id);
    })
    .then(function (service) {

      Topic.publish(Topic.channels.ADMIN, {
        event: Topic.events.UPDATE,
        entity: Topic.entities.SERVICE,
        user_id: req.session.user.id,
        id : req.params.id
      });

      res.status(200).json(service);
    })
    .catch(next)
    .done();
}

/**
 * @method remove
 *
 * @description
 * Remove a service in the database.
 */
function remove(req, res, next) {
  const sql = 'DELETE FROM service WHERE id = ?;';

  db.exec(sql, [req.params.id])
    .then(function (result) {

      if (!result.affectedRows) {
        throw new NotFound(`Could not find a service with id ${req.params.id}.`);
      }


      Topic.publish(Topic.channels.ADMIN, {
        event: Topic.events.DELETE,
        entity: Topic.entities.SERVICE,
        user_id: req.session.user.id,
        id: req.params.id
      });

      res.sendStatus(204);
    })
    .catch(next)
    .done();
}

/**
 * @method detail
 *
 * @description
 * Return a service details from the database
 */
function detail(req, res, next) {
  lookupService(req.params.id)
    .then(function (row) {
      res.status(200).json(row);
    })
    .catch(next)
    .done();
}

/**
 * @method lookupService
 *
 * @description
 * Return a service instance from the database
 *
 * @param {Number} id - the id of a service
 * @returns {Promise} - returns the result of teh database query
 */
function lookupService(id) {
  const sql =`
    SELECT s.id, s.name, s.enterprise_id, s.cost_center_id, s.profit_center_id
    FROM service AS s WHERE s.id = ?;
  `;

  return db.one(sql, id, id, 'service');
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.detail = detail;
