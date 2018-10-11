/**
 * HTTP END POINT
 * API for the entities/ http end point
 */
const uuid = require('uuid/v4');
const db = require('../../../lib/db');
const types = require('./types');

exports.types = types;
exports.list = list;
exports.details = details;
exports.update = update;
exports.remove = remove;
exports.create = create;

function list(req, res, next) {
  const query = `
    SELECT 
      BUID(e.uuid) AS uuid, e.display_name, e.gender, e.email, e.phone, e.address, 
      e.reference, et.id AS entity_type_id, et.label, et.translation_key
    FROM entity e
    JOIN entity_type et ON et.id = e.entity_type_id
  `;
  db.exec(query)
    .then(rows => res.status(200).json(rows))
    .catch(next)
    .done();
}

function details(req, res, next) {
  const query = `
    SELECT 
      BUID(e.uuid) AS uuid, e.display_name, e.gender, e.email, e.phone, e.address, 
      e.reference, et.id AS entity_type_id, et.label, et.translation_key
    FROM entity e
    JOIN entity_type et ON et.id = e.entity_type_id
    WHERE uuid = ?;
  `;
  db.one(query, [db.bid(req.params.uuid)])
    .then(rows => res.status(200).json(rows))
    .catch(next)
    .done();
}

function update(req, res, next) {
  const query = `
    UPDATE entity SET ? WHERE uuid = ?;
  `;

  const params = req.body;

  if (params.uuid) {
    delete params.uuid;
  }

  db.exec(query, [params, db.bid(req.params.uuid)])
    .then(() => res.sendStatus(204))
    .catch(next)
    .done();
}

function remove(req, res, next) {
  const query = `
    DELETE FROM entity WHERE uuid = ?;
  `;
  db.exec(query, [db.bid(req.params.uuid)])
    .then(() => res.sendStatus(204))
    .catch(next)
    .done();
}

function create(req, res, next) {
  console.log('req : ', req);
  const query = `
    INSERT INTO entity SET ?;
  `;
  const params = req.body;
  if (!params.uuid) {
    params.uuid = db.bid(uuid());
  }
  db.exec(query, [params])
    .then(() => res.status(201).send({ uuid : params.uuid }))
    .catch(next)
    .done();
}
