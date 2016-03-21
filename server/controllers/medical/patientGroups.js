/**
* The /patient_groups HTTP API endpoint
*
* @module medical/patient_groups
*
* @description This controller is responsible for implementing all crud and others custom request
* on thepatient groups table through the `/patient_groups` endpoint.
*
* @requires lib/db
* @requires node_uuid
**/ 

var db = require('../../lib/db');
var uuid = require('node-uuid');

/**
* Returns an array of patient groups
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express object to pass the controle to the next middleware
*
* @example
* // GET /patient_groups : Get list of patient groups
* var patientGroups = require('medical/patientGroups');
* patientGroups.list(req, res, next);
*/

function list (req, res, next) {
  'use strict';

  var sql =
    'SELECT pg.uuid, pg.name, pg.price_list_uuid, pg.note, pg.created FROM patient_group AS pg';

  if (req.query.full === '1') {
    sql =
      'SELECT pg.uuid, pg.name, pg.price_list_uuid, pg.note, pg.created, pl.label, pl.description ' +
      'FROM patient_group AS pg LEFT JOIN price_list AS pl ON pg.price_list_uuid = pl.uuid';
  }

  sql += ' ORDER BY pg.name;';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
* Create a patient group in the database
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express object to pass the controle to the next middleware
*
* @example
* // POST /patient_groups : Insert a patient group
* var patientGroups = require('medical/patient_groups');
* patientGroup.create(req, res, next);
*/

function create (req, res, next) {
  'use strict';

  var record = req.body;

  // Provide UUID if the client has not specified 
  record.uuid = record.uuid || uuid.v4();

  var createPatientGroupQuery = 'INSERT INTO patient_group SET ?';

  db.exec(createPatientGroupQuery, [record])
    .then(function (result) {
      res.status(201).json({ uuid: record.uuid });
    })
    .catch(next)
    .done();
}

/**
* Update a patient group in the database
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express object to pass the controle to the next middleware
*
* @example
* // PUT /patient_groups/uuid : update a service
* var patientGroups require('medical/patient_groups');
* services.update(req, res, next);
*/


function update (req, res, next) {
  'use strict';

  var queryData = req.body;
  var patientGroupId = req.params.uuid;
  var updatePatientGroupQuery = 'UPDATE patient_group SET ? WHERE uuid = ?';

  lookupPatientGroup(patientGroupId, req.codes)
    .then(function () {
      return db.exec(updatePatientGroupQuery, [queryData, patientGroupId]);
    })
    .then(function (result) {
      return lookupPatientGroup(patientGroupId, req.codes);
    })
    .then(function (patientGroup) {
      res.status(200).json(patientGroup);
    })
    .catch(next)
    .done();
}

/**
* Remove a patient group in the database
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express object to pass the controle to the next middleware
*
* @example
* // DELETE /patient_groups/uuid : delete a patient group
* var patientGroups require('medical/patient_groups');
* patientGroups.remove(req, res, next);
*/

function remove (req, res, next) {
  var patientGroupId = req.params.uuid;
  var removePatientGroupQuery = 'DELETE FROM patient_group WHERE uuid = ?';

  lookupPatientGroup(patientGroupId, req.codes)
    .then(function () {
      return db.exec(removePatientGroupQuery, [patientGroupId]);
    })
    .then(function () {
      res.status(204).send();
    })
    .catch(next)
    .done();
}

/**
* Return a patient group details from the database
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express object to pass the controle to the next middleware
*
* @example
* // GET /patient_groups : returns a patient group detail
* var patientGroups = require('medical/patient_groups');
* patientGroups.detail(req, res, next);
*/

function detail(req, res, next) {
  'use strict';

  lookupPatientGroup(req.params.uuid, req.codes)
    .then(function (row) {
      res.status(200).json(row);
    })
    .catch(next)
    .done();
}

/**
* Return a patient group instance from the database
*
* @param {integer} id of a service
* @param {object} codes object which contain errors code
*
*/

function lookupPatientGroup (uuid, codes) {
  'use strict';

  var sql =
    'SELECT pg.uuid, pg.name, pg.enterprise_id, pg.price_list_uuid, pg.note ' +
    'FROM patient_group AS pg WHERE pg.uuid = ?';

  return db.exec(sql, [uuid])
    .then(function (rows) {
      if (rows.length === 0) {
        throw new codes.ERR_NOT_FOUND();
      }
      return rows[0];
    });
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.detail = detail;
