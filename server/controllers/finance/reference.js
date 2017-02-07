var db = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');

function detail(req, res, next) {
  'use strict';

  lookupReference (req.params.id)
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
      `SELECT r.id, r.text, r.ref, r.is_report, r.position, r.reference_group_id, r.section_resultat_id,
      rg.text AS reference_group_text, sr.text AS section_resultat_text
      FROM reference AS r
      LEFT JOIN reference_group AS rg ON rg.id = r.reference_group_id
      LEFT JOIN section_resultat AS sr ON sr.id = r.section_resultat_id`;

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

  lookupReference(referenceId)
    .then(function () {
      return db.exec(updateReferenceQuery, [queryData, referenceId]);
    })
    .then(function (result) {
      return lookupReference(referenceId);
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

  lookupReference(referenceId)
    .then(function () {
      return db.exec(removeReferenceQuery, [referenceId]);
    })
    .then(function () {
      res.sendStatus(204);
   })
    .catch(next)
    .done();
}

function lookupReference(id) {
  var sql =
    `SELECT r.id, r.text, r.ref, r.is_report, r.position, r.reference_group_id, r.section_resultat_id
    FROM reference AS r WHERE r.id = ?`;

  return db.exec(sql, id)
    .then(function (rows) {
      // Record Not Found !
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
