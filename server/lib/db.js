// /scripts/lib/database/db.js

// Module: db.js

// TODO rewrite documentation - this module can now be required by any controller module throughout the application
// TODO Seperate DB wrapper and DB methods - this module should just initialise a new DB instance
// new db(config, etc.) and return it in module exports

// TODO EVERY query to the DB is currently handled on it's own connection, one
// HTTP request can result in tens of connections. Performance checks for
// sharing connections between request sessions (also allowing for shraring a
// transaction between unrelated components)

// The purpose of this module is managing client connections
// and disconnections to a variety of database management systems.
// All query formatting is expected to happen elsewhere.

var q = require('q');

var db, con, supportedDatabases, dbms;

// Initiliase module on startup - create once and allow db to be required anywhere
function initialise(cfg) {
  'use strict';

  cfg = cfg || {};

  // Select the system's database with this variable.
  dbms = cfg.dbms || 'mysql';

  // All supported dabases and their initializations
  supportedDatabases = {
    mysql    : mysqlInit
  };

  // The database connection for all data interactions
  con = supportedDatabases[dbms](cfg);

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

function getSupportedDatabases() {
  return Object.keys(supportedDatabases);
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

function mysqlInit (config) {
  'use strict';
  var db = require('mysql');
  return db.createPool(config);
}

function flushUsers (db_con) {
  'use strict';
  var permissions, reset, strict;

  // Disable safe mode #420blazeit
  // TODO  This should be optionally set as a flag - and reported (logged)
  permissions = 'SET SQL_SAFE_UPDATES = 0;';
  reset = 'UPDATE `user` SET user.active = 0 WHERE user.active = 1;';

  db_con.getConnection(function (err, con) {
    if (err) { throw err; }
    con.query(permissions, function (err) {
      if (err) { throw err; }
      con.release();
      db_con.getConnection(function (err, con) {
        if (err) { throw err; }
        con.query(reset, function (err) {
          if (err) { throw err; }

        });
      });
    });
  });
}

/*
// TODO: impliment PostgreSQL support
function postgresInit(config) {
  var db = require('pg');
  return true;
}

// TODO: impliment Firebird support
function firebirdInit(config) {
  var db = require('node-firebird');
  return true;
}

// TODO: impliment sqlite support
function sqliteInit(config) {
  var db = require('sqlite3');
  return true;
}
*/

// Uses an already existing connection to query the database, returning a promise
function queryConnection(connection, sql, params) {
  var deferred = q.defer();

  var qs = connection.query(sql, params, function (error, result) {
    if (error) { return deferred.reject(error); }
    return deferred.resolve(result);
  });

  // console.log('[Transaction] Query :', qs.sql);

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

//module.exports = db;
