/**
* The /services HTTP API endpoint
*
* @module admin/services
*
* @description This controller is responsible for implementing all crud and others custom request
* on the services table through the `/services` endpoint.
*
* @requires lib/db
**/ 

var db = require('../../lib/db');
var NotFound = require('../../lib/errors/NotFound');
var BadRequest = require('../../lib/errors/BadRequest');

/**
* Returns an array of services
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express object to pass the controle to the next middleware
*
* @example
* // GET /services : Get list of services
* var services = require('admin/services');
* services.list(req, res, next);
*/

function list (req, res, next) {
  'use strict';

  var sql =
    'SELECT s.id, s.name, s.cost_center_id, s.profit_center_id FROM service AS s';

  if (req.query.full === '1') {
    sql =
      `SELECT s.id, s.name, s.enterprise_id, s.cost_center_id, s.profit_center_id, e.name AS enterprise_name, e.abbr, cc.id AS cc_id, 
       cc.text AS cost_center_name, pc.id AS pc_id, pc.text AS profit_center_name
       FROM service AS s JOIN enterprise AS e ON s.enterprise_id = e.id
       LEFT JOIN cost_center AS cc ON s.cost_center_id = cc.id LEFT JOIN
       profit_center AS pc ON s.profit_center_id = pc.id`;
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
* Create a service in the database
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express object to pass the controle to the next middleware
*
* @example
* // POST /services : Insert a service
* var services = require('admin/services');
* services.create(req, res, next);
*/

function create (req, res, next) {
  'use strict';

  var record = req.body;
  var createServiceQuery = 'INSERT INTO service SET ?';

  delete record.id;

  db.exec(createServiceQuery, [record])
    .then(function (result) {
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
* var services = require('admin/services');
* services.update(req, res, next);
*/


function update (req, res, next) {
  'use strict';

  var queryData = req.body;
  var serviceId = req.params.id;
  var updateServiceQuery = 'UPDATE service SET ? WHERE id = ?';


  delete queryData.id;

  if(!isValidData(queryData)) {
    return next(
	  new BadRequest('You sent a bad value for some parameters in Update Service.')
	);
  }

  lookupService(serviceId)
    .then(function () {
      return db.exec(updateServiceQuery, [queryData, serviceId]);
    })
    .then(function (result) {
      return lookupService(serviceId);
    })
    .then(function (service) {
      res.status(200).json(service);
    })
    .catch(next)
    .done();
}

/**
* Remove a service in the database
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express object to pass the controle to the next middleware
*
* @example
* // DELETE /services : delete a service
* var services = require('admin/services');
* service.remove(req, res, next);
*/

function remove (req, res, next) {
  var serviceId = req.params.id;
  var removeServiceQuery = 'DELETE FROM service WHERE id=?';

  lookupService(serviceId)
    .then(function () {
      return db.exec(removeServiceQuery, [serviceId]);
    })
    .then(function () {
      res.status(204).send();
    })
    .catch(next)
    .done();
}

/**
* Return a service details from the database
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express object to pass the controle to the next middleware
*
* @example
* // GET /services : returns a service detail
* vaservices = require('admin/services');
*services.detail(req, res, next);
*/

function detail(req, res, next) {
  'use strict';

  lookupService(req.params.id)
    .then(function (row) {
      res.status(200).json(row);
    })
    .catch(next)
    .done();
}

/**
* Return a service instance from the database
*
* @param {integer} id of a service
*
*/

function lookupService(id) {
  'use strict';

  var sql =
    'SELECT s.id, s.name, s.enterprise_id, s.cost_center_id, s.profit_center_id FROM service AS s WHERE s.id=?';

  return db.exec(sql, id)
    .then(function (rows) {
      if (rows.length === 0) {
        throw new NotFound(`Could not find a Service with id ${id}`);
      }
      return rows[0];
    });
}

/**
* Return a boolean answer to know if a service is well formated for an update
* @param {object} service object which represente a service instance
*
*/

function isValidData (service){

  if (service.cost_center_id) {
    if (isNaN(Number(service.cost_center_id))) {
      return false;
    }
  }

  if (service.profit_center_id) {
    if (isNaN(Number(service.profit_center_id))) {
      return false;
    }
  }

  return true;
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.detail = detail;
