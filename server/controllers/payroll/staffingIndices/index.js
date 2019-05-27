const db = require('../../../lib/db');
const FilterParser = require('../../../lib/filter');

exports.list = list;
exports.detail = detail;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.lookUp = lookUp;


function lookUp(options = {}) {
  const sql = `
    SELECT BUID(s.uuid) as uuid, s.value, BUID(g.uuid) as grade_uuid, 
      g.code, g.text
    FROM staffing_indice s
    JOIN grade g ON g.uuid = s.grade_uuid
  `;
  db.convert(options, ['uuid', 'grade_uuid']);

  const filters = new FilterParser(options, { tableAlias : 's' });
  filters.equals('uuid');
  filters.equals('grade_uuid');
  filters.setOrder('ORDER BY g.text ASC');

  return db.exec(filters.applyQuery(sql), filters.parameters());
}

// retrieve all staffing indexes
function list(req, res, next) {
  lookUp(req.query)
    .then(rows => {
      res.status(200).json(rows);
    }).catch(next)
    .done();
}


function detail(req, res, next) {
  const sql = `
    SELECT BUID(uuid) as uuid, value, BUID(grade_uuid) as grade_uuid 
    FROM staffing_indice
    WHERE uuid=?`;

  db.one(sql, db.bid(req.params.uuid)).then(indice => {
    res.status(200).json(indice);
  }).catch(next);

}

// create a new staffing index
function create(req, res, next) {
  const sql = `INSERT INTO staffing_indice SET ?`;

  db.exec(sql, {
    uuid : db.uuid(),
    value : req.body.value,
    grade_uuid : db.bid(req.body.grade_uuid),
  })
    .then(rows => {
      res.status(201).json(rows);
    })
    .catch(next);
}


// update a staffing index
function update(req, res, next) {
  db.convert(req.body, ['uuid', 'grade_uuid']);

  const staffingIndex = req.body;
  delete staffingIndex.uuid;

  const sql = `UPDATE staffing_indice SET ? WHERE uuid = ?`;

  db.exec(sql, [staffingIndex, db.bid(req.params.uuid)])
    .then(rows => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

// delete a staffing index
function remove(req, res, next) {
  const binaryUuid = db.bid(req.params.uuid);

  const sql = `DELETE FROM staffing_indice WHERE uuid = ?`;
  db.exec(sql, binaryUuid)
    .then(rows => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}
