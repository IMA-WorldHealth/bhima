/**
 * @overview Department
 *
 * @description
 * The /department HTTP API endpoint
 *
 * @description
 * This controller is responsible for implementing all crud and others custom request
 * on the department table through the `/department` endpoint.
 *
 * @requires lib/util
 * @requires db
 * @requires NotFound
 */


const db = require('../../lib/db');

exports.read = read;
exports.detail = detail;
exports.create = create;
exports.delete = remove;
exports.update = update;
/**
 retrieve all department for an enterprise
 */
function read(req, res, next) {
  const sql = `
    SELECT BUID(uuid) as uuid, name, enterprise_id 
    FROM department
    WHERE enterprise_id=?`;
  const enterpriseId = req.query.enterprise_id;

  db.exec(sql, enterpriseId)
    .then(departments => {
      res.status(200).json(departments);
    })
    .catch(next)
    .done();
}

/**
 retrieve a department details
 */
function detail(req, res, next) {
  const sql = `
    SELECT BUID(uuid) as uuid, name, enterprise_id 
    FROM department
    WHERE uuid=?`;

  const uuid = db.bid(req.params.uuid);

  db.one(sql, uuid)
    .then(departments => {
      res.status(200).json(departments);
    })
    .catch(next)
    .done();
}


/**
 * Add a new department for an enterprise
 */
function create(req, res, next) {

  const sql = `INSERT INTO department SET ?`;
  const data = req.body;
  data.uuid = data.uuid ? db.bid(data.uuid) : db.uuid();

  db.exec(sql, data).then(() => {
    res.sendStatus(201);
  })
    .catch(next)
    .done();
}

/**
 * Update a department
*/

function update(req, res, next) {
  const sql = `UPDATE department SET ? WHERE uuid = ?`;
  const data = req.body;
  delete data.uuid;
  const uuid = db.bid(req.params.uuid);

  db.exec(sql, [data, uuid]).then(() => {
    res.sendStatus(200);
  })
    .catch(next)
    .done();
}

/*
remove a department
*/
function remove(req, res, next) {
  const sql = `DELETE FROM department WHERE uuid = ?`;
  const uuid = db.bid(req.params.uuid);

  db.exec(sql, uuid).then(() => {
    res.sendStatus(204);
  })
    .catch(next)
    .done();
}
