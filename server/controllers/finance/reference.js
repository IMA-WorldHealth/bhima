var db = require('../../lib/db');

function getReference (req, res, next){
  'use strict';

  handleFetchReference (req.params.id)
  .then(function (rows) {
    if(rows.length === 0){
      res.status(404).send();
    }else{
      res.status(200).json(rows[0]);
    }
  })
  .catch(next)
  .done();
}

function list (req, res, next){
  'use strict';

  var sql = 
    'SELECT r.id, r.text, r.ref FROM reference AS r';

  if(req.query.list === 'full'){
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
  var createReferenceQuery = 'INSERT INTO reference SET ?';
  
  db.exec(createReferenceQuery, [record])
  .then(function (result){
    res.status(201).json({ id: result.insertId });
  })
  .catch(next)
  .done();
}

function update (req, res, next){
  var queryData = req.body;
  var referenceId = req.params.id;
  var updateReferenceQuery = 'UPDATE reference SET ? WHERE id = ?';

  db.exec(updateReferenceQuery, [queryData, referenceId])
  .then(function (result){
    return handleFetchReference(referenceId);
  })
  .then(function (references){
    var updatedReference = references[0];
    res.status(200).json(updatedReference);
  })
  .catch(next)
  .done();
}

function remove (req, res, next) {
  var referenceId = req.params.id;
  var removeReferenceQuery = 'DELETE FROM reference WHERE id=?';

  db.exec(removeReferenceQuery, [referenceId])
  .then(function (results){
    res.status(200).send();
  })
  .catch(next)
  .done();
}

function handleFetchReference (id){
  var sql = 
    'SELECT r.id, r.text, r.ref, r.is_report, r.position, r.reference_group_id, r.section_resultat_id ' +
    'FROM reference AS r WHERE r.id = ?';

  return db.exec(sql, id);
}
exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.getReference = getReference;
