/**
 * @module util
 *
 * @description
 * This module contains useful utility functions
 *
 * @required lodash
 */


const _ = require('lodash');
const q = require('q');

/** The query string conditions builder */
module.exports.queryCondition = queryCondition;
module.exports.parseQueryStringToSQL = parseQueryStringToSQL;
module.exports.take = take;
module.exports.isTrueString = isTrueString;
module.exports.isFalsy = isFalsy;
module.exports.uniquelize = uniquelize;
module.exports.loadModuleIfExists = requireModuleIfExists;
exports.resolveObject = resolveObject;

/**
 * @function queryCondition
 *
 * @description
 * Build query string conditions
 *
 * @param {String} sql - the SQL string
 * @param {Object} params - The req.query object
 * @param {Boolean} excludeWhere - should we append a WHERE condition?
 * @return {Object} The object which contains the query and conditions
 *
 * @todo - should this be in db?  Something like db.conditions()?
 * @todo - allow prexisting conditions to be passed in
 */

function queryCondition(sql, params, excludeWhere, dateConditon) {
  let conditions = [];

  let dateParams = {
    dateFrom: new Date(params.dateFrom),
    dateTo: new Date(params.dateTo)
  };

  if (Object.keys(params).length === 0) {
    excludeWhere = true;
  }

  // remove date in params
  delete params.dateFrom;
  delete params.dateTo;

  let criteria = Object.keys(params).map(function (item) {
    conditions = conditions.concat(item, params[item]);
    return item === 'date' ? 'DATE(??) = DATE(?)' :
      item.indexOf('uuid') > -1 ? '?? = HUID(?)'  : '?? = ?';
  }).join(' AND ');

  if (dateParams.dateFrom && dateParams.dateTo && dateConditon) {
    criteria += conditions.length ? ' AND ' + dateConditon : dateConditon;
    conditions.push(dateParams.dateFrom);
    conditions.push(dateParams.dateTo);
  }

  sql += (excludeWhere ? '' : 'WHERE ') + criteria;
  return { query: sql, conditions : conditions };
}

// prefix is a string
function parseQueryStringToSQL(options, tablePrefix) {
  let conditions = {
    statements: [],
    parameters: []
  };

  // exit early if an empty object is passed in.
  if (_.isEmpty(options)) {
    return conditions;
  }

  tablePrefix = tablePrefix || '';

  let escapedKeys = _.mapKeys(options, (value, key) => tablePrefix.concat('.', key));

  _.forEach(escapedKeys, (value, key) => {
    conditions.statements.push(`${key} = ?`);
    conditions.parameters.push(value);
  });

  return conditions;
}


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
 *
 * @public
 */
function take() {

  // get the arguments as an array
  let keys = Array.prototype.slice.call(arguments);

  // return the filter function
  return function filter(object) {
    return keys.map(function (key) {
      return object[key];
    });
  };
}

/**
 * String to boolean
 * @function stringToBool
 * @param {string} value The string to evaluate
 * @return {boolean}
 */
function isTrueString(value) {
  return (value + '').toLowerCase() === 'true';
}

/**
 * isFalsy
 * @function isFalsy
 * @param {string} value The string to evaluate
 * @return {boolean}
 */
function isFalsy(value) {
  value += '';
  return value.toLowerCase() === 'null' ||
    value.toLowerCase() === 'undefined' ||
    value.toLowerCase() === 'false' ||
    value.toLowerCase() === '0' ||
    value.toLowerCase() === '';
}

/**
 * @function uniquelize
 * @param {array} array An array in which we want to get only unique values
 * @description return an array which contain only unique values
 */
function uniquelize (array) {
  return _.uniq(array);
}

/**
* @method requireModuleIfExists
* @description load a module if it exists
*/
function requireModuleIfExists(moduleName) {
  try {
      require(moduleName);
  } catch (err) {
      return false;
  }
  return true;
}

/**
 * @function resolveObject
 *
 * @description
 * This utility takes in an object of promise queries and returns the object
 * with all values resolved when all promises have settled.  If any one is
 * rejected, the promise is rejected.
 *
 * @param {Object} object - this is the object of keys mapped to promise
 *   values.
 * @returns {Promise} - one all promises resolve, the same object mapped to
 */
function resolveObject(object) {
  const settled = {};

  return q.all(_.values(object))
    .then(results => {
      _.keys(object).forEach((key, index) => settled[key] = results[index]);
      return settled;
    });
}
