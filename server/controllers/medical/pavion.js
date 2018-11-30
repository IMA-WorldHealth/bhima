const db = require('./../../lib/db');

module.exports.create = create;
module.exports.update = update;
module.exports.delete = remove;
module.exports.read = read;
module.exports.detail = detail;


// register a new pavion
function create(req, res, next) {
  const data = req.body;
  data.uuid = db.bid(data.uuid || db.uuid());
  const sql = 'INSERT INTO pavion SET ?';

  db.exec(sql, data).then(() => {
    res.sendStatus(201);
  })
    .catch(next);
}

// modify a pavion informations
function update(req, res, next) {
  const data = req.body;
  delete data.uuid;
  const uuid = db.bid(req.params.uuid);
  const sql = `UPDATE pavion SET ? WHERE uuid =?`;

  db.exec(sql, [data, uuid]).then(() => {
    res.sendStatus(200);
  })
    .catch(next);
}

// delete a patient
function remove(req, res, next) {
  const uuid = db.bid(req.params.uuid);
  const sql = `DELETE FROM pavion WHERE uuid=?`;

  db.exec(sql, uuid).then(() => {
    res.sendStatus(204);
  })
    .catch(next);
}

// get all pavions
function read(req, res, next) {
  const sql = `
    SELECT BUID(uuid) as uuid, name, description, project_id, service_id
    FROM pavion
  `;

  db.exec(sql).then(pavions => {
    res.status(200).json(pavions);
  })
    .catch(next);
}

// get a specific pavion
function detail(req, res, next) {
  const sql = `
    SELECT BUID(uuid) as uuid, name, description, project_id, service_id
    FROM pavion
    WHERE uuid=?
  `;
  const uuid = db.bid(req.params.uuid);
  db.one(sql, uuid).then(pavion => {
    res.status(200).json(pavion);
  })
    .catch(next);
}
