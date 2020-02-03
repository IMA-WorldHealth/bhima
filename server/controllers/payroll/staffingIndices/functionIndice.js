const db = require('../../../lib/db');
const FilterParser = require('../../../lib/filter');

exports.list = list;
exports.detail = detail;
exports.create = create;
exports.update = update;
exports.delete = remove;
exports.lookUp = lookUp;


// retrieve all staffing indexes
function list(req, res, next) {
  lookUp(req.query)
    .then(staffingFunctionIndices => {
      res.json(staffingFunctionIndices);
    }).catch(next);
}


function detail(req, res, next) {
  const sql = `
    SELECT HEX(uuid) as uuid, value, fonction_id
    FROM staffing_function_indice
    WHERE uuid = ?`;

  db.one(sql, db.bid(req.params.uuid)).then(staffingFunctionIndice => {
    res.status(200).json(staffingFunctionIndice);
  }).catch(next);
}


// create a new staffing_function_indice
function create(req, res, next) {
  const sql = `INSERT INTO staffing_function_indice  SET ?`;

  const staffingFunctionIndice = req.body;
  staffingFunctionIndice.uuid = staffingFunctionIndice.uuid ? db.bid(staffingFunctionIndice.uuid) : db.uuid();
  db.exec(sql, staffingFunctionIndice)
    .then(() => {
      res.sendStatus(201);
    })
    .catch(next);
}


// update a staffing_function_indice
function update(req, res, next) {

  db.convert(req.body, ['uuid']);

  const staffingFunctionIndice = req.body;
  delete staffingFunctionIndice.uuid;

  const sql = `UPDATE staffing_function_indice  SET ? WHERE uuid = ?`;

  db.exec(sql, [staffingFunctionIndice, db.bid(req.params.uuid)])
    .then(staffingFunctionIndices => {
      res.status(200).json(staffingFunctionIndices);
    })
    .catch(next);
}

// delete a staffing_function_indice
function remove(req, res, next) {
  const id = db.bid(req.params.uuid);

  const sql = `DELETE FROM staffing_function_indice WHERE uuid = ?`;
  db.exec(sql, id)
    .then(() => {
      res.sendStatus(200);
    })
    .catch(next);
}


function lookUp(options = {}) {
  const sql = `
    SELECT HEX(s.uuid) as uuid, s.value, s.fonction_id, f.fonction_txt
    FROM staffing_function_indice AS s
    JOIN fonction f on f.id = s.fonction_id
  `;

  db.convert(options, ['uuid']);

  const filters = new FilterParser(options, {
    tableAlias : 's',
  });

  filters.equals('uuid');
  filters.equals('value');
  filters.equals('fonction_id');

  return db.exec(filters.applyQuery(sql), filters.parameters());
}
