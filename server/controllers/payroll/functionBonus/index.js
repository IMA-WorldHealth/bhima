const db = require('../../../lib/db');
const FilterParser = require('../../../lib/filter');

exports.list = list;
exports.detail = detail;
exports.create = create;
exports.update = update;
exports.delete = remove;


function lookUp(options = {}) {
  const sql = `
    SELECT BUID(fb.uuid) as uuid,
      fb.value, fb.fonction_id, f.fonction_txt
    FROM function_bonus fb
    JOIN fonction f ON f.id = fb.fonction_id
  `;

  db.convert(options, ['uuid']);

  const filters = new FilterParser(options, { tableAlias : 'fb' });
  filters.equals('uuid');
  filters.equals('fonction_id');
  filters.setOrder('ORDER BY f.fonction_txt ASC');

  return db.exec(filters.applyQuery(sql), filters.parameters());
}

// retrieve all function bonuses
function list(req, res, next) {
  lookUp(req.query)
    .then(rows => {
      res.status(200).json(rows);
    }).catch(next);
}

// API for /function_bonus/:uuid
async function detail(req, res, next) {
  const sql = `
    SELECT BUID(uuid) as uuid, value, fonction_id
    FROM function_bonus
    WHERE uuid=?
  `;

  db.one(sql, db.bid(req.params.uuid)).then(bonus => {
    res.status(200).json(bonus);
  }).catch(next);
}

// create a new function bonus
function create(req, res, next) {
  const sql = `INSERT INTO function_bonus SET ?`;
  const data = req.body;
  data.uuid = db.uuid();

  db.exec(sql, data)
    .then(rows => {
      res.status(201).json(rows);
    })
    .catch(next);
}

// update a function bonus
function update(req, res, next) {
  db.convert(req.body, ['uuid']);

  const functionBonus = req.body;
  delete functionBonus.uuid;

  const sql = `UPDATE function_bonus SET ? WHERE uuid = ?`;

  db.exec(sql, [functionBonus, db.bid(req.params.uuid)])
    .then(rows => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

// delete a function bonus
function remove(req, res, next) {
  const binaryUuid = db.bid(req.params.uuid);

  const sql = `DELETE FROM function_bonus WHERE uuid = ?`;
  db.exec(sql, binaryUuid)
    .then(rows => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}
