/**
 * @module util
 *
 * @description
 * This module contains useful utility functions
 */

'use strict';

/** The query string conditions builder */
module.exports.queryCondition = queryCondition;
module.exports.take = take;
module.exports.isTrueString = isTrueString;
module.exports.isFalsy = isFalsy;
module.exports.uniquelize = uniquelize;
module.exports.moduleExists = moduleExists;

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
    return '?? = ?';
  }).join(' AND ');

  if (dateParams.dateFrom && dateParams.dateTo && dateConditon) {
    criteria += conditions.length ? ' AND ' + dateConditon : dateConditon;
    conditions.push(dateParams.dateFrom);
    conditions.push(dateParams.dateTo);
  }

  sql += (excludeWhere ? '' : 'WHERE ') + criteria;
  return { query: sql, conditions : conditions };
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
  // the second param is the next value in the array.
  return array.reduce(function (uniq, value) {

    // if we haven't seen the value yet, add it to the array (otherwise, ignore it).
    if (uniq.indexOf(value) === -1) { uniq.push(value); }
    return uniq;

  }, []);  // initialize with an empty array
}

 /**
  * @method moduleExists
  * @description check if a module exist
  */
  function moduleExists(moduleName) {
    try {
        require(moduleName);
    } catch (err) {
        return false;
    }
    return true;
  }
