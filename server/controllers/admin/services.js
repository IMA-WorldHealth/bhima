/**
 * @overview Services
 *
 * @description
 * The /services HTTP API endpoint
 *
 * @description
 * This controller is responsible for implementing all crud and others custom request
 * on the services table through the `/services` endpoint. *
 * @requires node-uuid
 * @requires db
 * @requires NotFound
 * @requires BadRequest
 * @requires Topic
 */


const uuid = require('node-uuid');
const db = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');
const Topic = require('../../lib/topic');

/**
 * @method list
 *
 * @description
 * Returns an array of services from the database.
 */
function list(req, res, next) {
  let sql =
    'SELECT s.id, s.name, s.cost_center_id, s.profit_center_id, BUID(s.uuid) AS uuid FROM service AS s';

  if (req.query.full === '1') {
    sql = `
      SELECT s.id, s.name, s.enterprise_id, s.cost_center_id, BUID(s.uuid) AS uuid, 
        s.profit_center_id, e.name AS enterprise_name, e.abbr, cc.id AS cc_id,
        cc.text AS cost_center_name, pc.id AS pc_id, pc.text AS profit_center_name,
        d.text as depot_name, BUID(d.uuid) as service_depot_uuid
      FROM service AS s
      JOIN enterprise AS e ON s.enterprise_id = e.id 
      LEFT JOIN depot d ON d.service_uuid = s.uuid
      LEFT JOIN cost_center AS cc ON s.cost_center_id = cc.id
      LEFT JOIN profit_center AS pc ON s.profit_center_id = pc.id`;
  }

  sql += ' ORDER BY s.name;';

  db.exec(sql)
    .then((rows) => {
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
  const serviceRecord = req.body;
  const transaction = db.transaction();

  // add contextual information
  serviceRecord.enterprise_id = req.session.enterprise.id;

  // service unique uuid as entity uuid
  serviceRecord.uuid = db.bid(uuid.v4());

  // remove id if it exists
  delete serviceRecord.id;

  // depot parameters
  const depotRecord = {
    uuid : db.bid(uuid.v4()),
    text : 'Service - '.concat(serviceRecord.name),
    enterprise_id : serviceRecord.enterprise_id,
    service_uuid : serviceRecord.uuid,
  };

  const insertService = `INSERT INTO service SET ?`;
  const insertDepot = `INSERT INTO depot SET ?`;

  transaction.addQuery(insertService, [serviceRecord]);
  transaction.addQuery(insertDepot, [depotRecord]);

  transaction.execute()
    .then((result) => {
      Topic.publish(Topic.channels.ADMIN, {
        event : Topic.events.CREATE,
        entity : Topic.entities.SERVICE,
        user_id : req.session.user.id,
        id : result[0].insertId,
      });
      res.status(201).json({ id : result[0].insertId });
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
  const queryData = req.body;
  const sql = `UPDATE service SET ? WHERE id = ?;`;

  delete queryData.id;
  delete queryData.uuid;

  db.exec(sql, [queryData, req.params.id])
    .then((result) => {
      if (!result.affectedRows) {
        throw new NotFound(`Could not find a service with id ${req.params.id}.`);
      }

      return lookupService(req.params.id);
    })
    .then((service) => {
      Topic.publish(Topic.channels.ADMIN, {
        event : Topic.events.UPDATE,
        entity : Topic.entities.SERVICE,
        user_id : req.session.user.id,
        id : req.params.id,
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
  const transaction = db.transaction();

  const queryService = 'SELECT uuid FROM service WHERE id = ?;';

  const removeDepot = 'DELETE FROM depot WHERE service_uuid = ?;';

  const removeService = 'DELETE FROM service WHERE uuid = ?;';

  db.one(queryService, [req.params.id])
    .then((service) => {
      transaction.addQuery(removeDepot, [service.uuid]);
      transaction.addQuery(removeService, [service.uuid]);
      return transaction.execute();
    })
    .then((result) => {
      if (!result[1].affectedRows) {
        throw new NotFound(`Could not find a service with id ${req.params.id}.`);
      }

      Topic.publish(Topic.channels.ADMIN, {
        event : Topic.events.DELETE,
        entity : Topic.entities.SERVICE,
        user_id : req.session.user.id,
        id : req.params.id,
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
    .then((row) => {
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
  const sql =
    `
    SELECT 
      s.id, s.name, s.enterprise_id, s.cost_center_id, s.profit_center_id 
    FROM 
      service AS s 
    WHERE 
      s.id = ?;`;

  return db.one(sql, id, id, 'service');
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.detail = detail;
