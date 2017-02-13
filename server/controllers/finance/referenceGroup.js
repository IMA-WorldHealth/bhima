var db = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');

function lookupReferenceGroup(id) {

  var sql =
    'SELECT id, reference_group, text, position, section_bilan_id FROM reference_group WHERE id = ?';

  return db.exec(sql, id)
    .then(function (rows) {
      // Record Not Found !
      if (rows.length === 0) {
        throw new NotFound(`Record Not Found with id: ${id}`);
      }

      return rows[0];
    });
}

function detail(req, res, next) {

  lookupReferenceGroup(req.params.id)
  .then(function (row) {
    res.status(200).json(row);
  })
  .catch(next)
  .done();
}

function list(req, res, next) {
  var sql;

  if (req.query.detailed === '1') {
    sql =
      `SELECT reference_group.id, reference_group.reference_group, reference_group.text, reference_group.position,
      reference_group.section_bilan_id, section_bilan.text AS sectionBilanText
      FROM reference_group
      JOIN section_bilan ON section_bilan.id = reference_group.section_bilan_id`;

   } else {
    sql =
      'SELECT id, text, reference_group FROM reference_group';
  }

   db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

function create (req, res, next) {

  var record = req.body;
  var sql = 'INSERT INTO reference_group SET ?';

  delete record.id;

  db.exec(sql, [record])
  .then(function (result) {
    res.status(201).json({id : result.insertId});
  })
  .catch(next)
  .done();
}

function update(req, res, next) {

  var queryData = req.body;
  var sectionBilanId = req.params.id;
  var sql = 'UPDATE reference_group SET ? WHERE id = ?';

  delete queryData.id;
  delete queryData.sectionBilanText;

  lookupReferenceGroup(sectionBilanId)
  .then(function () {
    return db.exec(sql, [queryData, sectionBilanId]);
  })
  .then(function () {
    return lookupReferenceGroup(sectionBilanId);
  })
  .then(function (sectionBilan) {
    res.status(200).json(sectionBilan);
  })
  .catch(next)
  .done();
}

function remove(req, res, next) {

  var sectionBilanId = req.params.id;
  var sql = 'DELETE FROM reference_group WHERE id = ?';

  lookupReferenceGroup(sectionBilanId)
    .then(function () {
      return db.exec(sql, [sectionBilanId]);
    })
    .then(function () {
      res.sendStatus(204);
    })
    .catch(next)
    .done();
}



exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.detail = detail;
