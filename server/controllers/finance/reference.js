var db = require('../../lib/db');
var NotFound = require('../../lib/errors/NotFound');

function detail(req, res, next) {
  'use strict';

  lookupReference (req.params.id, req.codes)
    .then(function (row) {
      res.status(200).json(row);
    })
    .catch(next)
    .done();
}

function list(req, res, next) {
  'use strict';

  var sql =
    'SELECT r.id, r.text, r.ref FROM reference AS r';

  if (req.query.full === '1') {
    sql =
      'SELECT r.id, r.text, r.ref, r.is_report, r.position, r.reference_group_id, r.section_resultat_id ' +
      'FROM reference AS r';
  }

  sql += ' ORDER BY r.ref;';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

function create (req, res, next) {
  'use strict';

  var record = req.body;
  var createReferenceQuery = 'INSERT INTO reference SET ?';

  delete record.id;

  db.exec(createReferenceQuery, [record])
  .then(function (result) {
    res.status(201).json({ id: result.insertId });
  })
  .catch(next)
  .done();
}

function update (req, res, next) {
  'use strict';

  var queryData = req.body;
  var referenceId = req.params.id;
  var updateReferenceQuery = 'UPDATE reference SET ? WHERE id = ?';

  delete queryData.id;

  lookupReference(referenceId, req.codes)
    .then(function () {
      return db.exec(updateReferenceQuery, [queryData, referenceId]);
    })
    .then(function (result) {
      return lookupReference(referenceId, req.codes);
    })
    .then(function (reference) {
      res.status(200).json(reference);
    })
    .catch(next)
    .done();
}

function remove (req, res, next) {

  var referenceId = req.params.id;
  var removeReferenceQuery = 'DELETE FROM reference WHERE id=?';

  lookupReference(referenceId, req.codes)
    .then(function () {
      return db.exec(removeReferenceQuery, [referenceId]);
    })
    .then(function () {
      res.status(204).send();
   })
    .catch(next)
    .done();
}

function lookupReference(id, codes) {
  var sql =
    'SELECT r.id, r.text, r.ref, r.is_report, r.position, r.reference_group_id, r.section_resultat_id ' +
    'FROM reference AS r WHERE r.id = ?';

  return db.exec(sql, id)
    .then(function (rows) {
      if (rows.length === 0) {
        throw new NotFound(`Could not find a reference with id ${id}`);
      }

      return rows[0];
    });
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.detail = detail;
