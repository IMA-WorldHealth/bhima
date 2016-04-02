var db = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');

function lookupSectionBilan(id) {
  'use strict';

  var sql =
    'SELECT id, text, position, is_actif FROM section_bilan WHERE id = ?';

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

  lookupSectionBilan(req.params.id)
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
      'SELECT id, text, position, is_actif FROM section_bilan';       
  } else {
    sql =
      'SELECT id, text FROM section_bilan';
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
  var sql = 'INSERT INTO section_bilan SET ?';

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
  var sectionBilanId = req.params.id;
  var sql = 'UPDATE section_bilan SET ? WHERE id = ?';

  delete queryData.id;

  lookupSectionBilan(sectionBilanId)
  .then(function () {
    return db.exec(sql, [queryData, sectionBilanId]);
  })
  .then(function () {
    return lookupSectionBilan(sectionBilanId);
  })
  .then(function (sectionBilan) {
    res.status(200).json(sectionBilan);
  })
  .catch(next)
  .done();
}

function remove(req, res, next) {

  var sectionBilanId = req.params.id;
  var sql = 'DELETE FROM section_bilan WHERE id = ?';

  lookupSectionBilan(sectionBilanId)
    .then(function () {
      return db.exec(sql, [sectionBilanId]);
    })
    .then(function () {
      res.status(204).send();
    })
    .catch(next)
    .done();
}



exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.detail = detail;