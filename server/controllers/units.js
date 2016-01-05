/**
* Units Controller
*
* Lists units for the endpoint /units
*/
var db = require('../lib/db');
var ROOT_NODE = 0;

exports.list = function list(req, res, next) {
  'use strict';

  var sql = 
    'SELECT unit.id, unit.name, unit.key, unit.description, unit.parent ' +
    'FROM unit WHERE unit.id <> ?;';

  db.exec(sql, [ ROOT_NODE ])
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};
