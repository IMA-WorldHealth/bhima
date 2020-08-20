const db = require('../../lib/db');

module.exports = {
  create,
  update,
  read,
  remove,
  detail,
};

function create(req, res, next) {
  const data = req.body;
  db.exec(`INSERT INTO donor SET ?`, data).then(() => {
    res.sendStatus(201);
  }).catch(next);
}

function update(req, res, next) {
  const data = req.body;
  const { id } = req.params;
  db.exec(`UPDATE donor SET ? WHERE id=?`, [data, id]).then(() => {
    res.sendStatus(200);
  }).catch(next);
}

function read(req, res, next) {
  db.exec(`SELECT id, display_name FROM donor`).then(donors => {
    res.status(200).json(donors);
  }).catch(next);
}

function detail(req, res, next) {
  const { id } = req.params;
  db.one(`SELECT id, display_name FROM donor WHERE id=?`, id).then(donor => {
    res.status(200).json(donor);
  }).catch(next);
}

function remove(req, res, next) {
  const { id } = req.params;
  db.exec(`DELETE FROM donor WHERE id=?`, id).then(() => {
    res.sendStatus(200);
  }).catch(next);
}
