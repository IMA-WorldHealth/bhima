/**
* @module lib/util
* @description Ths modoule contains some usefull utilities functions
* @required util
*/

/** javascript strict mode */
'use strict';

var util = require('util');

/** The query string conditions builder */
module.exports.queryCondition = queryCondition;

/** The toMysqlDate function */
module.exports.toMysqlDate = util.deprecate(toMysqlDate, 'util.toMysqlDate() is deprecated and will be removed soon. Please use db.js\'s native date parsing.');

/**
* @function queryCondition
* @description build query string conditions
* @param {string} query The sql query
* @param {object} requestQuery The req.query object
* @return {object} The object which contains the query and conditions
*/
function queryCondition(query, requestQuery) {
  var criteria, conditions = [];

  criteria = Object.keys(requestQuery).map(function (item) {
    conditions = conditions.concat(item, requestQuery[item]);
    return '?? = ?';
  }).join(' AND ');

  query += (Object.keys(requestQuery).length > 0) ? 'WHERE ' + criteria : '';
  return { query : query, conditions : conditions };
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
