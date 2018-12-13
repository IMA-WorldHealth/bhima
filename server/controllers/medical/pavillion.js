const db = require('./../../lib/db');

module.exports.create = create;
module.exports.update = update;
module.exports.delete = remove;
module.exports.read = read;
module.exports.detail = detail;


// register a new pavillion
function create(req, res, next) {
  const data = req.body;
  data.uuid = db.bid(data.uuid || db.uuid());
  const sql = 'INSERT INTO pavillion SET ?';

  db.exec(sql, data).then(() => {
    res.sendStatus(201);
  })
    .catch(next);
}

// modify a pavillion informations
function update(req, res, next) {
  const data = req.body;
  delete data.uuid;
  const uuid = db.bid(req.params.uuid);
  const sql = `UPDATE pavillion SET ? WHERE uuid =?`;

  db.exec(sql, [data, uuid]).then(() => {
    res.sendStatus(200);
  })
    .catch(next);
}

// delete a patient
function remove(req, res, next) {
  const uuid = db.bid(req.params.uuid);
  const sql = `DELETE FROM pavillion WHERE uuid=?`;

  db.exec(sql, uuid).then(() => {
    res.sendStatus(204);
  })
    .catch(next);
}

// get all pavillions
function read(req, res, next) {
  const sql = `
    SELECT BUID(p.uuid) as uuid, p.name, 
      p.description, p.service_id,
      s.name as serviceName
    FROM pavillion p
    LEFT JOIN service s ON s.id = p.service_id
  `;

  db.exec(sql).then(pavillions => {
    res.status(200).json(pavillions);
  })
    .catch(next);
}

// get a specific pavillion
function detail(req, res, next) {
  const sql = `
    SELECT BUID(uuid) as uuid, name, description, service_id
    FROM pavillion
    WHERE uuid=?
  `;
  const uuid = db.bid(req.params.uuid);
  db.one(sql, uuid).then(pavillion => {
    res.status(200).json(pavillion);
  })
    .catch(next);
}
