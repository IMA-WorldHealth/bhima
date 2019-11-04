const q = require('q');
const debug = require('debug')('db:transaction');

/** @const the number of times a transaction is restarted in case of deadlock */
const MAX_TRANSACTION_DEADLOCK_RESTARTS = 5;

/** @const the number of milliseconds delayed before restarting the transaction */
const TRANSACTION_DEADLOCK_RESTART_DELAY = 50;

// Uses an already existing connection to query the database, returning a promise
function queryConnection(connection, sql, params) {
  const deferred = q.defer();

  const query = connection.query(sql, params, (error, result) => {
    if (error) {
      deferred.reject(error);
    } else {
      deferred.resolve(result);
    }
  });

  debug(`#queryConnection(): ${query.sql.trim()}`);

  return deferred.promise;
}

/**
 * @class Transaction
 *
 * @description
 * Wraps transaction logic in a promise to handle rollback and commits as a
 * single transactional entity.
 *
 * Note that this module is required by the bhima
 * database connector and will be exposed via a public API there - controllers
 * should not be using this directly.
 *
 * @requires q
 * @requires debug
 *
 * @example
 * const db = require('db');
 * let transaction = new Transaction(db);
 * transaction
 *   .addQuery('SELECT 1;')
 *   .addQuery('SELECT 2;')
 *   .execute()
 *   .then(results => console.log(results))
 *   .catch(error => console.error(error));
 */
class Transaction {
  /**
   * @constructor
   *
   * @param {Function|Object} db - the database connector (@see db)
   */
  constructor(db) {
    this.queries = [];
    this.db = db;
    this.restarts = 0;
    debug('#constructor(): initializing transaction...');
  }

  /**
   * @method addQuery
   *
   * @param {String} query - the SQL template string to be passed to the
   * connection.query() method.
   * @param {Object|Array|Undefined} params - the parameters to be templated
   * into the query string.
   * @returns this;
   *
   * @example
   * const transaction = new Transaction(db);
   * transaction
   *
   *   // this query has no parameters
   *   .addQuery('SELECT 1')
   *
   *   // this query uses an array of parameters
   *   .addQuery('SELECT column AS name FROM table WHERE id = ?', [1]);
   */
  addQuery(query, params) {
    this.queries.push({ query, params });
    return this;
  }

  /**
   * @method execute
   *
   * @description
   * Executes the query chain in a transaction.  To accomplish this, the
   * transaction opens up a transaction on the database connection, maps all
   * queries to executed promises, and returns the results.  The connection is
   * destroyed after this method is called.
   *
   * @returns {Promise} - the results of the transaction execution
   */
  execute() {
    debug(`#execute(): Executing ${this.queries.length} queries.`);
    const deferred = q.defer();

    const { queries } = this;
    const { pool } = this.db;

    // get a connection from the database to execute the transaction
    pool.getConnection((error, connection) => {
      if (error) {
        debug('#execute(): Error acquiring DB connection.');
        debug('#execute(): %o', error);
        deferred.reject(error);
        return;
      }

      debug(`#execute(): DB connection acquired from pooled connections.`);

      // with the acquired connection, get a transaction object
      connection.beginTransaction((e) => {
        debug('#execute(): Beginning Transaction.');
        if (e) {
          debug('#execute(): Begin Transaction Error:');
          debug('#execute(): %o', e);
          return deferred.reject(e);
        }

        // map promises through to database queries
        const promises = queries.map(bundle => queryConnection(connection, bundle.query, bundle.params));

        // make sure that all queries are executed successfully.
        return q.all(promises)
          .then((results) => {
            debug('#execute(): All queries settled, commiting transacton.');
            // all queries completed - attempt to commit
            connection.commit((err) => {
              if (err) { throw err; }
              debug('#execute(): Transaction commited. Closing connections.');
              connection.destroy();
              deferred.resolve(results);
            });
          })
          .catch((err) => {
            debug('#execute(): An error occured in the transaction. Rolling back.');
            debug('#execute(): %o', err);

            // individual query did not work - rollback transaction
            connection.rollback(() => {
              connection.destroy();
            });


            // increment the number of restarts
            this.restarts += 1;
            const isDeadlock = (err.code === 'ER_LOCK_DEADLOCK');

            // restart transactions a set number of times if the error is due to table deadlocks
            if (isDeadlock && this.restarts < MAX_TRANSACTION_DEADLOCK_RESTARTS) {
              debug(`#execute(): Txn deadlock!  Restarts: ${this.restarts} of ${MAX_TRANSACTION_DEADLOCK_RESTARTS}.`);
              debug(`#execute(): Reattempt transaction after ${TRANSACTION_DEADLOCK_RESTART_DELAY}ms.`);

              // set up a promise to delay the transaction restart
              const delay = q.defer();

              // restart transaction after a delay
              setTimeout(() => {
                delay.resolve(this.execute());
              }, TRANSACTION_DEADLOCK_RESTART_DELAY);

              // return the promise
              return delay.promise
                .then(results => deferred.resolve(results))
                .catch(sqlError => deferred.reject(sqlError));
            }

            // if we get here, all attempted restarts failed.  Report an error in case tables are permanently locked.
            if (isDeadlock) {
              debug('#execute(): Unrecoverable deadlock error.');
              debug(`#execute(): Completed ${this.restarts} / ${MAX_TRANSACTION_DEADLOCK_RESTARTS} restarts.`);
              debug('#execute(): Transaction will not be reattempted.');
            }

            return deferred.reject(err);
          });
      });
    });

    return deferred.promise;
  }
}

module.exports = Transaction;
