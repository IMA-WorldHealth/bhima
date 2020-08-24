const db = require('../../lib/db');

module.exports = {
  create,
  read,
  update,
  detail,
  delete : remove,
};

// add a new tag
function create(req, res, next) {
  const sql = `INSERT INTO tags SET ?`;
  const data = req.body;
  data.uuid = data.uuid ? db.bid(data.uuid) : db.uuid();
  db.exec(sql, data)
    .then(() => {
      res.sendStatus(201);
    }).catch(next);
}

// update tag information
function update(req, res, next) {
  const sql = `UPDATE tags SET ?  WHERE uuid =?`;
  const data = req.body;
  delete data.uuid;
  const uuid = db.bid(req.params.uuid);

  db.exec(sql, [data, uuid])
    .then(() => {
      res.sendStatus(200);
    }).catch(next);
}

// get all tags
function read(req, res, next) {
  const sql = `
    SELECT BUID(uuid) as uuid, name, color
    FROM tags
    ORDER BY name ASC
  `;

  db.exec(sql)
    .then(rows => {
      res.status(200).json(rows);
    }).catch(next);
}

// get a tag detail
function detail(req, res, next) {
  const sql = `
    SELECT BUID(uuid) as uuid, name, color
    FROM tags
    WHERE uuid =?
  `;
  const uuid = db.bid(req.params.uuid);
  db.one(sql, uuid)
    .then(tag => {
      res.status(200).json(tag);
    }).catch(next);
}

// get a tag detail
function remove(req, res, next) {
  const sql = `
    DELETE FROM tags WHERE uuid =?
  `;
  const uuid = db.bid(req.params.uuid);
  db.exec(sql, uuid)
    .then(rows => {
      res.status(204).json(rows);
    }).catch(next);
}
