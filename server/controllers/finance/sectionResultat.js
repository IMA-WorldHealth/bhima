var db = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');

function lookupSectionResultat(id) {
  'use strict';

  var sql =
    'SELECT id, text, position, is_charge FROM section_resultat WHERE id = ?';

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
  'use strict';

  lookupSectionResultat(req.params.id)
  .then(function (row) {
    res.status(200).json(row);
  })
  .catch(next)
  .done();
}

function list(req, res, next) {
  'use strict';
  var sql;

  if (req.query.detailed === '1') {
    sql =
      'SELECT id, text, position, is_charge FROM section_resultat';
  } else {
    sql =
      'SELECT id, text FROM section_resultat';
  }

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
  var sql = 'INSERT INTO section_resultat SET ?';

  delete record.id;

  db.exec(sql, [record])
  .then(function (result) {
    res.status(201).json({id : result.insertId});
  })
  .catch(next)
  .done();
}

function update(req, res, next) {
  'use strict';

  var queryData = req.body;
  var sectionResultatId = req.params.id;
  var sql = 'UPDATE section_resultat SET ? WHERE id = ?';

  delete queryData.id;

  lookupSectionResultat(sectionResultatId)
  .then(function () {
    return db.exec(sql, [queryData, sectionResultatId]);
  })
  .then(function () {
    return lookupSectionResultat(sectionResultatId);
  })
  .then(function (sectionResultat) {
    res.status(200).json(sectionResultat);
  })
  .catch(next)
  .done();
}

function remove(req, res, next) {

  var sectionResultatId = req.params.id;
  var sql = 'DELETE FROM section_resultat WHERE id = ?';

  lookupSectionResultat(sectionResultatId)
    .then(function () {
      return db.exec(sql, [sectionResultatId]);
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
