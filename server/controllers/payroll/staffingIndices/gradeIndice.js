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
    .then(staffingGradeIndices => {
      res.json(staffingGradeIndices);
    }).catch(next);
}


function detail(req, res, next) {
  const sql = `
    SELECT HEX(uuid) as uuid, value, HEX(grade_uuid) as grade_uuid
    FROM staffing_grade_indice
    WHERE uuid = ?`;

  db.one(sql, db.bid(req.params.uuid)).then(staffingGradeIndice => {
    res.status(200).json(staffingGradeIndice);
  }).catch(next);
}


// create a new staffing_grade_indice
function create(req, res, next) {
  const sql = `INSERT INTO staffing_grade_indice  SET ?`;

  const staffingGradeIndice = req.body;

  staffingGradeIndice.uuid = staffingGradeIndice.uuid ? staffingGradeIndice.uuid : db.uuid();

  db.convert(staffingGradeIndice, ['uuid', 'grade_uuid']);

  db.exec(sql, staffingGradeIndice)
    .then(() => {
      res.sendStatus(201);
    })
    .catch(next);
}


// update a staffing_grade_indice
function update(req, res, next) {

  db.convert(req.body, ['uuid', 'grade_uuid']);

  const staffingGradeIndice = req.body;
  delete staffingGradeIndice.uuid;

  const sql = `UPDATE staffing_grade_indice  SET ? WHERE uuid = ?`;

  db.exec(sql, [staffingGradeIndice, db.bid(req.params.uuid)])
    .then(staffingGradeIndices => {
      res.status(200).json(staffingGradeIndices);
    })
    .catch(next);
}

// delete a staffing_grade_indice
function remove(req, res, next) {
  const id = db.bid(req.params.uuid);

  const sql = `DELETE FROM staffing_grade_indice WHERE uuid = ?`;
  db.exec(sql, id)
    .then(() => {
      res.sendStatus(200);
    })
    .catch(next);
}


function lookUp(options = {}) {
  const sql = `
    SELECT HEX(s.uuid) as uuid, s.value, HEX(s.grade_uuid) as grade_uuid
       ,g1.code as grade_code, g1.text as grade_text, g1.basic_salary as grade_basic_salary
    FROM staffing_grade_indice AS s 
    JOIN grade as g1 ON g1.uuid = s.grade_uuid 
  `;

  db.convert(options, ['uuid', 'grade_uuid']);

  const filters = new FilterParser(options, {
    tableAlias : 's',
  });

  filters.equals('uuid');
  filters.equals('value');
  filters.equals('grade_uuid');

  return db.exec(filters.applyQuery(sql), filters.parameters());
}
