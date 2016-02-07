// server/lib/db.js

// TODO rewrite documentation - this module can now be required by any controller module throughout the application
// TODO Seperate DB wrapper and DB methods - this module should just initialise a new DB instance
// new db(config, etc.) and return it in module exports

// TODO EVERY query to the DB is currently handled on it's own connection, one
// HTTP request can result in tens of connections. Performance checks for
// sharing connections between request sessions (also allowing for shraring a
// transaction between unrelated components)

var q       = require('q');
var mysql   = require('mysql');
var winston = require('winston');
var util    = require('util');

var con;

// Initiliase module on startup - create once and allow db to be required anywhere
function initialise() {
  'use strict';

  // configure MySQL via environmental variables
  con = mysql.createPool({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });
}

function exec(sql, params) {
  var dfd = q.defer();

  con.getConnection(function (err, connection) {
    if (err) { return dfd.reject(err); }

    var qs = connection.query(sql, params, function (err, results) {
      connection.release();
      if (err) { return dfd.reject(err); }
      dfd.resolve(results);
    });

    // log the SQL if in debug mode
    winston.log('debug', qs.sql);
  });

  return dfd.promise;
}

function execute(sql, callback) {
  con.getConnection(function (err, connection) {
    if (err) { return callback(err); }
    connection.query(sql, function (err, results) {
      connection.release();
      if (err) { return callback(err); }
      return callback(null, results);
    });
  });
}

function execTransaction(queryList) {
  var deferred = q.defer();
  var transactionPromises = [];

  // Consider one query passed to method
  queryList = queryList.length ? queryList : [queryList];

  con.getConnection(function (error, connection) {
    if (error) {
      return deferred.reject(error);
    }

    // Successful connection
    connection.beginTransaction(function (error) {
      if (error) {
        return deferred.reject(error);
      }

      // Successful transaction initialisation
      transactionPromises = queryList.map(function (queryObject) {
        var query = queryObject.query;
        var params = queryObject.params;

        return queryConnection(connection, query, params);
      });

      q.all(transactionPromises)
        .then(function (results) {

          // All querys completed - attempt to commit
          connection.commit(function (error) {
            if (error) {
              connection.rollback(function () {
                connection.release();
                deferred.reject(error);
                winston.log('debug', '[Transaction] Rollback due to : %j', error);
              });
              return;
            }

            connection.release();
            deferred.resolve(results);
          });
        })
        .catch(function (error) {

          // Individual query did not work - rollback transaction
          connection.rollback(function () {
            connection.release();
            deferred.reject(error);
            winston.log('debug', '[Transaction] Rollback due to : %j', error);
          });
        });
    });

  });

  return deferred.promise;
}

// TODO verify this object is cleaned up after use
function transaction() {
  var self = {};

  self.queryList = [];
  self.addQuery = addQuery;
  self.execute = execution;

  // Format the query, params request and insert into the list of querys to be
  // executed
  function addQuery(query, params) {

    self.queryList.push({
      query : query,
      params : params
    });
    return self;
  }

  function execution() {
    return execTransaction(self.queryList);
  }

  return self;
}

// Uses an already existing connection to query the database, returning a promise
function queryConnection(connection, sql, params) {
  var dfd = q.defer();

  var qs = connection.query(sql, params, function (error, result) {
    if (error) { return dfd.reject(error); }
    return dfd.resolve(result);
  });

  winston.log('debug', '[Transaction] %s', qs.sql);

  return dfd.promise;
}

function sanitize(x) {
  return con.escape(x);
}

module.exports = {
  initialise:  initialise,
  exec:        exec,
  transaction: transaction,
  execute:     util.deprecate(execute, 'db.execute() is deprecated, use db.exec() instead.'),
  sanitize:    util.deprecate(sanitize, 'db.sanitize() is deprecated, use db.escape instead.'),
  escape:      sanitize
};
