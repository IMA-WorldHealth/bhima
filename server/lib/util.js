/**
* @module lib/util
* @description This modolue contains useful utility functions
*/

/** javascript strict mode */
'use strict';

var util = require('util');

/** The query string conditions builder */
module.exports.queryCondition = queryCondition;

/** The toMysqlDate function */
module.exports.toMysqlDate = util.deprecate(toMysqlDate, 'util.toMysqlDate() is deprecated and will be removed soon. Please use db.js\'s native date parsing.');

module.exports.take = take;

/**
* @function queryCondition
* @description build query string conditions
* @param {object} params - The req.query object
* @return {object} The object which contains the query and conditions
*/
function queryCondition(sql, params) {
  var conditions = [];

  var criteria = Object.keys(params).map(function (item) {
    conditions = conditions.concat(item, params[item]);
    return '?? = ?';
  }).join(' AND ');

  sql += (Object.keys(params).length > 0) ? 'WHERE ' + criteria : '';
  return { query: sql, conditions : conditions };
}

/** @deprecated toMysqlDate - Please use db.js's native date parsing */
function toMysqlDate (dateString) {
  // This style of convert to MySQL date avoids changing
  // the prototype of the global Date object
  if (!dateString) { return new Date().toISOString().slice(0, 10); }

  var date = new Date(dateString),
    year = String(date.getFullYear()),
    month = String(date.getMonth() + 1),
    day = String(date.getDate());

  month = month.length < 2 ? '0' + month : month;
  day = day.length < 2 ? '0' + day : day;

  return [year, month, day].join('-');
}


/**
 * Creates a filter to be passed to a Array.map() function.  This filter will
 * flatten an array of JSONs in to an array of arrays with values matching the
 * keys specified as arguments, in the order that they are specified.
 *
 * @method take
 * @returns {function} filter - a filtering function to that will convert an
 * object to an array with the given keys.
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
  var keys = Array.prototype.slice.call(arguments);

  // return the filter function
  return function filter(object) {
    return keys.map(function (key) {
      return object[key];
    });
  };
}
