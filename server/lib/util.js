/**
 * A variety of utilities to use in the server.  This should be replaced with a
 * tested npm module in the future.
 *
 * @module lib/util
 * @todo remove deprecated functions
 */

// import Node's native util
var util = require('util');

/** check if an arry or object is empty */
exports.empty = function empty(object) {
  'use strict';
  if (Array.isArray(object)) {
    return object.length === 0;
  } else {
    return Object.keys(object).length === 0;
  }
};


/**
 * check if a value is an array.  Will be removed at the release of bhima-2.X.
 * @deprecated since bhima-2.X
 */
exports.isArray =
  util.deprecate(Array.isArray, 'Use the native Array.isArray() instead.');


/** check if a value is an integer */
exports.isInt = function isInt(value) {
  return (Math.floor(value) === Number(value));
};

/** check if a value is a number. This also works for hexadecimal ('0x12') */
function isNumber(value) {
  return !Number.isNaN(Number(value));
}

exports.isNumber = isNumber;

/** check if a value is a string */
exports.isString = function isString(value) {
  return (typeof value === 'string');
};

/** check if a value is an object */
exports.isObject = function isObject(value) {
  return (typeof value === 'object');
};

/**
 * converts a date or date string to a mysql-friendly date
 * @deprecated since bhima-2.X
 */
function toMysqlDate(dateString) {

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

exports.toMysqlDate =
  util.deprecate(toMysqlDate, 'Use node-mysql\'s automatic date escaping.');

/** check if a value is a postive number */
function isPositive(value) {
  return isNumber(value) && Number(value) >= 0;
}

exports.isPositive = isPositive;

/** check if a value is a negative number */
exports.isNegative = function (value) {
  return isNumber(value) && !isPositive(value);
};

/** check if a value is defined */
exports.isDefined = function isDefined(value) {
  return value !== undefined;
};
