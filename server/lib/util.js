/* eslint global-require:off, import/no-dynamic-require:off, no-restricted-properties:off */

/**
 * @overview util
 *
 * @description
 * This module contains useful utility functions used throughout the server.
 *
 * @requires lodash
 * @requires q
 * @requires moment
 * @requires debug
 * @requires child_process
 * @requires util
 */

const _ = require('lodash');
const q = require('q');
const moment = require('moment');
const debug = require('debug')('util');
const { exec } = require('child_process');
const fs = require('fs');

exports.take = take;
exports.loadModuleIfExists = requireModuleIfExists;
exports.dateFormatter = dateFormatter;
exports.execp = execp;
exports.unlinkp = unlinkp;
exports.format = require('util').format;

exports.roundDecimal = roundDecimal;
exports.loadDictionary = loadDictionary;

/**
 * @function take
 *
 * @description
 * Creates a filter to be passed to a Array.map() function.  This filter will
 * flatten an array of JSONs in to an array of arrays with values matching the
 * keys specified as arguments, in the order that they are specified.
 *
 * @returns {Function} filter - a filtering function to that will convert an
 *   object to an array with the given keys.
 *
 * @example
 * var _ = require('lodash');
 *
 * var array = [{
 *   id: 1,
 *   season: 'summer',
 * }, {
 *   id : 2,
 *   season : 'winter'
 * }, {
 *   id : 3,
 *   season : 'fall'
 * }];
 *
 * // take the ids from the JSON array
 * var filter = take('id');
 * var ids = _.flatMap(array, filter); // returns [1, 2, 3];
 * var ids = _.map(array, filter); // returns [ [1], [2], [3]];
 *
 * // take both the id and the season properties from the array
 * var filter = take('id', 'season');
 * var arrs = _.map(array, filter); // returns [[1, 'summer], [2, 'winter'], [3, 'fall']]
 */
function take(...keys) {
  // get the arguments as an array
  // return the filter function
  return object => (keys.map(key => object[key]));
}

/**
 * @method requireModuleIfExists
 * @description load a module if it exists
 */
function requireModuleIfExists(moduleName) {
  try {
    require(moduleName);
    debug(`Dynamically loaded ${moduleName}.`);
  } catch (err) {
    return false;
  }
  return true;
}

/**
 * @method dateFormatter
 *
 * @description
 * Accepts an object of key/value pairs. Returns the same object with all values
 * that are dates converted to a standard format.
 */
function dateFormatter(rows, dateFormat) {
  const DATE_FORMAT = dateFormat || 'YYYY-MM-DD HH:mm:ss';

  _.forEach(rows, element => {
    _.forEach(element, (value, key) => {
      if (_.isDate(element[key])) {
        element[key] = moment(element[key]).format(DATE_FORMAT);
      }
    });
  });

  return rows;
}

/**
 * @method execp
 *
 * @description
 * This method promisifies the child process exec() function.  It is used in
 * lib/backup.js, but will likely be handy in other places as well.
 */
function execp(cmd) {
  debug(`#execp(): ${cmd}`);
  const deferred = q.defer();
  const child = exec(cmd);
  child.addListener('error', deferred.reject);
  child.addListener('exit', deferred.resolve);
  return deferred.promise;
}


/**
 * @method statp
 *
 * @description
 * This method promisifies the unlink method.
 */
function unlinkp(file) {
  debug(`#unlinkp(): ${file}`);
  const deferred = q.defer();

  fs.unlink(file, (err) => {
    if (err) { return deferred.reject(err); }
    return deferred.resolve();
  });

  return deferred.promise;
}

/**
 * Round a decimal to a certain precision
 * @param {*} number
 * @param {*} precision
 */
function roundDecimal(number, precision = 4) {
  const base = Math.pow(10, precision);
  return Math.round(number * base) / base;
}

/**
 * @function loadDictionary
 *
 * @description
 * Either returns a cached version of the dictionary, or loads the dictionary
 * into the cache and returns it.
 *
 * @param {String} key - either 'fr' or 'en'
 */
function loadDictionary(key, dictionaries = {}) {
  const dictionary = dictionaries[key];
  if (dictionary) { return dictionary; }

  dictionaries[key] = require(`../../client/i18n/${key}.json`);
  return dictionaries[key];
}
