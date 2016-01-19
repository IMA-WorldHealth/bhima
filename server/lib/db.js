// /scripts/lib/db.js

// TODO rewrite documentation - this module can now be required by any controller module throughout the application
// TODO Seperate DB wrapper and DB methods - this module should just initialise a new DB instance
// new db(config, etc.) and return it in module exports

// TODO EVERY query to the DB is currently handled on it's own connection, one
// HTTP request can result in tens of connections. Performance checks for
// sharing connections between request sessions (also allowing for shraring a
// transaction between unrelated components)

var q = require('q');
var mysql = require('mysql');

var con;

// Initiliase module on startup - create once and allow db to be required anywhere
function initialise() {
  'use strict';

  // configure MySQL via environmental variables
  con = mysql.createPool({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME
  });

  //  FIXME reset all logged in users on event of server crashing / terminating - this
  //  should be removed/ implemented into the error/logging module before shipping
  flushUsers(con);
}

function exec(sql, params) {
  var defer = q.defer();

  con.getConnection(function (err, connection) {
    if (err) { return defer.reject(err); }

    var qs = connection.query(sql, params, function (err, results) {
      connection.release();
      if (err) { return defer.reject(err); }
      defer.resolve(results);
    });
  });

  return defer.promise;
}

function execute(sql, callback) {
  // This fxn is formated for mysql pooling, not in all generality
  console.log('[DEPRECATED] [db] [execute]: ', sql);

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

      // console.log('[Transaction] begin transaction');

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
                // console.log('[Transaction] Commit failure - rollback success');

                connection.release();
                deferred.reject(error);
              });
              return;
            }

            connection.release();
            // console.log('[Transaction] Commit success - all changes saved');
            deferred.resolve(results);
          });
        })
        .catch(function (error) {

          // Individual query did not work - rollback transaction
          connection.rollback(function () {
            // console.log('[Transaction] Query failure - rollback success');
            connection.release();
            deferred.reject(error);
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

function flushUsers(handle) {
  'use strict';
  var permissions, reset;

  // Disable safe mode #420blazeit
  // TODO This should be optionally set as a flag - and reported (logged)
  permissions = 'SET SQL_SAFE_UPDATES = 0;';
  reset = 'UPDATE `user` SET user.active = 0 WHERE user.active = 1;';

  handle.getConnection(function (err, con) {
    if (err) { throw err; }
    con.query(permissions, function (err) {
      if (err) { throw err; }
      con.release();
      handle.getConnection(function (err, con) {
        if (err) { throw err; }
        con.query(reset, function (err) {
          if (err) { throw err; }
        });
      });
    });
  });
}

// Uses an already existing connection to query the database, returning a promise
function queryConnection(connection, sql, params) {
  var deferred = q.defer();

  var qs = connection.query(sql, params, function (error, result) {
    if (error) { return deferred.reject(error); }
    return deferred.resolve(result);
  });

  //console.log('[Transaction] Query :', qs.sql);

  return deferred.promise;
}

function sanitize(x) {
  return con.escape(x);
}

module.exports = {
  initialise:  initialise,
  exec:        exec,
  transaction: transaction,
  execute:     execute,
  sanitize:    sanitize, // FIXME: is this even used?
  escape:      sanitize
};
