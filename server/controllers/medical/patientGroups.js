/**
* The /patient_groups HTTP API endpoint
*
* @module medical/patient_groups
*
* @description This controller is responsible for implementing all crud and others custom request
* on the patient groups table through the `/patient_groups` endpoint.
*
* @requires lib/db
* @requires node_uuid
**/

var db = require('../../lib/db');
var uuid = require('node-uuid');
var NotFound = require('../../lib/errors/NotFound');

// converts data's uuids to binary uuids as required
function convert(data) {
  var keys = [ 'price_list_uuid' ];

  keys.forEach(function (key) {
    if (data[key]) {
      data[key] = db.bid(data[key]);
    }
  });

  return data;
}

/**
* Returns an array of patient groups
*/
function list(req, res, next) {
  'use strict';

  var sql =
    'SELECT BUID(pg.uuid) as uuid, pg.name, BUID(pg.price_list_uuid) as price_list_uuid, pg.note, pg.created_at FROM patient_group AS pg';

  if (req.query.detailed === '1') {
    sql =
      `SELECT BUID(pg.uuid) as uuid, pg.name, BUID(pg.price_list_uuid) as price_list_uuid, pg.note, pg.created_at, pl.label AS priceListLable, pl.description
      FROM patient_group AS pg LEFT JOIN price_list AS pl ON pg.price_list_uuid = pl.uuid`;
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
*/
function create(req, res, next) {
  'use strict';

  var record = convert(req.body);

  // provide UUID if the client has not specified
  record.uuid = db.bid(record.uuid || uuid.v4());

  var sql = 'INSERT INTO patient_group SET ?';

  db.exec(sql, [ record ])
  .then(function (result) {
    res.status(201).json({ uuid: uuid.unparse(record.uuid) });
  })
  .catch(next)
  .done();
}

/**
* Update a patient group in the database
*/
function update(req, res, next) {
  'use strict';

  var uid = db.bid(req.params.uuid);
  var sql = 'UPDATE patient_group SET ? WHERE uuid = ?';

  var data = convert(req.body);

  if (data.created_at) {
    data.created_at = new Date(data.created_at);
  }

  // make sure we aren't updating the uuid
  delete data.uuid;

  db.exec(sql, [data, uid])
  .then(function (rows) {
    if (!rows.affectedRows) {
      throw new NotFound('No patient group found with id ' + uuid.unparse(uid));
    }

    return lookupPatientGroup(uid);
  })
  .then(function (group) {
    res.status(200).json(group);
  })
  .catch(next)
  .done();
}

/**
* Remove a patient group in the database
*/
function remove(req, res, next) {
  const id = db.bid(req.params.uuid);
  var sql = 'DELETE FROM patient_group WHERE uuid = ?';

  db.exec(sql, [ id ])
  .then(function (rows) {
    if (!rows.affectedRows) {
      throw new NotFound('No patient group found with id ' + uuid.unparse(id));
    }

    res.sendStatus(204);
  })
  .catch(next)
  .done();
}

/**
* Return a patient group details from the database
*/
function detail(req, res, next) {
  'use strict';

  lookupPatientGroup(db.bid(req.params.uuid))
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
*/
function lookupPatientGroup(uid) {
  'use strict';

  var sql =
    `SELECT BUID(pg.uuid) as uuid, pg.name, pg.enterprise_id, BUID(pg.price_list_uuid) as price_list_uuid, pg.note, pg.created_at
    FROM patient_group AS pg WHERE pg.uuid = ?`;

  return db.exec(sql, [uid])
  .then(function (rows) {
    if (!rows.length) {
      throw new NotFound('No patient group found with id ' + uuid.unparse(uid));
    }
    return rows[0];
  });
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.detail = detail;
