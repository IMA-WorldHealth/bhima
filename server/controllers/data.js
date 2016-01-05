/**
 * Data controller for enabling the client to directly (via JSON) manipulate the 
 * database - this is in the process of refactor, potentially depreciated for 
 * server side database manipulation and standardised API
 */ 

var url = require('url'),
    qs = require('querystring'),
    db = require('../lib/db'),
    util = require('../lib/util'),
    parser = require('../lib/parser');

/*
 * HTTP Controllers
*/
exports.create = function create(req, res, next) {
  var sql, data;

  // TODO
  //   This checks if data is an array and stuffs it
  //   into an array if it is not.  This should be done on the
  //   client (by connect).
  data = util.isArray(req.body.data) ? req.body.data : [req.body.data];
  sql = parser.insert(req.body.table, data);

  db.exec(sql)
  .then(function (ans) {
    res.send({ insertId: ans.insertId });
  })
  .catch(next)
  .done();
};

exports.read = function read(req, res, next) {
  var query, data, sql;

  query = qs.parse(decodeURI(url.parse(req.url).query)).q;
  data = JSON.parse(query);
  sql = parser.select(data);

  db.exec(sql)
  .then(function (rows) {
    res.send(rows);
  })
  .catch(next)
  .done();
};

exports.update = function update(req, res, next) {
  // TODO : change the client to stop packaging data in an array...
  var sql = parser.update(req.body.table, req.body.data[0], req.body.pk[0]);

  db.exec(sql)
  .then(function (ans) {
    res.send({ insertId: ans.insertId });
  })
  .catch(next)
  .done();
};

// TODO Ensure naming conventions are consistent - delete is a keyword in javascript
exports.deleteRecord = function deleteRecord(req, res, next) {
  var sql = parser.delete(req.params.table, req.params.column, req.params.value);
  db.exec(sql)
  .then(function () {
    res.send();
  })
  .catch(next)
  .done();
};
