var db = require('../../lib/db');

function getReference (req, res, next){
  'use strict';

  var sql = 
    'SELECT r.id, r.text, r.ref, r.is_report, r.position, r.reference_group_id, r.section_resultat_id ' +
    'FROM reference AS r WHERE r.id = ?';

  db.exec(sql, req.params.id)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

function list (req, res, next){
  'use strict';

  var sql = 
    'SELECT r.id, r.text, r.ref FROM reference AS r';

  if(req.query.list == 'full'){
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
  var record = req.body;
  var create_reference_query = 'INSERT INTO reference SET ?';
  var transaction = db.transaction();

  transaction
  .addQuery(create_reference_query, [record]);

  transaction.execute()
  .then(function (results){
    var confirmation = results;
    res.status(201).json(confirmation);
    return;
  })
  .catch(next)
  .done();
}

function update (req, res, next){
  var queryData = req.body;
  var referenceId = req.params.id;
  var update_reference_query = 'UPDATE reference SET ? WHERE id = ?';

  db.exec(update_reference_query, [queryData, referenceId])
  .then(function (results){
    var confirmation = results;
    res.status(200).json(confirmation);
    return;
  })
  .catch(next)
  .done();
}

function remove (req, res, next) {
  var referenceId = req.params.id;
  var remove_reference_query = 'DELETE FROM reference WHERE id=?';

  db.exec(remove_reference_query, [referenceId])
  .then(function (results){
    var confirmation = results;
    res.status(200).json(confirmation);
    return;
  })
  .catch(next)
  .done();
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.getReference = getReference;
