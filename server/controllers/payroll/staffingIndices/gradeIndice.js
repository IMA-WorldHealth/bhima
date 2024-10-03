const db = require('../../../lib/db');
const FilterParser = require('../../../lib/filter');

exports.list = list;
exports.detail = detail;
exports.create = create;
exports.update = update;
exports.delete = remove;
exports.lookUp = lookUp;
exports.listRubrics = listRubrics;

exports.listRubricsGrade = listRubricsGrade;
exports.detailRubricsGrade = detailRubricsGrade;
exports.createRubricsGrade = createRubricsGrade;
exports.updateRubricsGrade = updateRubricsGrade;
exports.deleteRubricsGrade = deleteRubricsGrade;

exports.listRubricsGradeEmployee = listRubricsGradeEmployee;

// retrieve all staffing indexes
function list(req, res, next) {
  lookUp(req.query)
    .then(staffingGradeIndices => {
      res.json(staffingGradeIndices);
    }).catch(next);
}

function listRubrics(req, res, next) {
  const sql = `
    SELECT rp.id, rp.label, rp.abbr
    FROM rubric_payroll AS rp
    WHERE rp.is_linked_to_grade = 1;
  `;

  db.exec(sql).then(rubrics => {
    res.status(200).json(rubrics);
  }).catch(next);
}

function listRubricsGradeEmployee(req, res, next) {
  const sql = `
    SELECT rgi.rubric_id, rgi.value
    FROM employee AS emp
    JOIN patient AS pa ON pa.uuid = emp.patient_uuid
    JOIN rubric_grade_indice AS rgi ON rgi.grade_uuid = emp.grade_uuid
    JOIN rubric_payroll AS rb ON rb.id = rgi.rubric_id
    WHERE emp.uuid = ?;
  `;

  db.exec(sql, [db.bid(req.query.employee_uuid)]).then(rubrics => {
    res.status(200).json(rubrics);
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
  filters.setOrder('ORDER BY g1.text ASC');

  return db.exec(filters.applyQuery(sql), filters.parameters());
}

// retrieve all staffing indexes
function listRubricsGrade(req, res, next) {
  lookUpRubricsGrade(req.query)
    .then(staffingGradeIndices => {
      res.json(staffingGradeIndices);
    }).catch(next);
}

function detailRubricsGrade(req, res, next) {
  const sql = `
    SELECT HEX(uuid) as uuid, value, HEX(grade_uuid) as grade_uuid
    FROM staffing_grade_indice
    WHERE uuid = ?`;

  db.one(sql, db.bid(req.params.uuid)).then(staffingGradeIndice => {
    res.status(200).json(staffingGradeIndice);
  }).catch(next);
}

// create a new staffing_grade_indice
function createRubricsGrade(req, res, next) {
  const sql = `INSERT INTO rubric_grade_indice  SET ?`;

  const gradeIndice = req.body.data;

  gradeIndice.uuid = gradeIndice.uuid ? gradeIndice.uuid : db.uuid();

  db.convert(gradeIndice, ['uuid', 'grade_uuid']);

  db.exec(sql, gradeIndice)
    .then(() => {
      res.sendStatus(201);
    })
    .catch(next);
}

// update a staffing_grade_indice
function updateRubricsGrade(req, res, next) {

  db.convert(req.body, ['uuid', 'grade_uuid']);

  const gradeIndice = req.body;
  delete gradeIndice.uuid;

  const sql = `UPDATE rubric_grade_indice  SET ? WHERE uuid = ?`;

  db.exec(sql, [gradeIndice, db.bid(req.params.uuid)])
    .then(gradeIndices => {
      res.status(200).json(gradeIndices);
    })
    .catch(next);
}

// delete a staffing_grade_indice
function deleteRubricsGrade(req, res, next) {
  const id = db.bid(req.params.uuid);

  const sql = `DELETE FROM rubric_grade_indice WHERE uuid = ?`;
  db.exec(sql, id)
    .then(() => {
      res.sendStatus(200);
    })
    .catch(next);
}

function lookUpRubricsGrade(options = {}) {
  const sql = `
    SELECT HEX(rgi.uuid) as uuid, rgi.rubric_id, rgi.value, HEX(rgi.grade_uuid) as grade_uuid,
    g1.code as grade_code, g1.text as grade_text, g1.basic_salary as grade_basic_salary
    FROM rubric_grade_indice AS rgi
    JOIN grade as g1 ON g1.uuid = rgi.grade_uuid
  `;

  db.convert(options, ['uuid', 'grade_uuid']);

  const filters = new FilterParser(options, {
    tableAlias : 'rgi',
  });

  filters.equals('uuid');
  filters.equals('value');
  filters.equals('rubric_id');
  filters.equals('grade_uuid');
  filters.setOrder('ORDER BY g1.text ASC');

  return db.exec(filters.applyQuery(sql), filters.parameters());
}
