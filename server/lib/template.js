/**
 * @overview template
 *
 * @description
 * This service is a wrapper for the express handlebars library. It sets the required configuration options and provides
 * a number of helper methods that are exposed to templates.
 * - translate - convert a translation key into the current languages text
 * - multiply - multiply two numbers together
 * - currency - convert a number into a currency string based on currently selected currency
 *
 * @requires express-handlebars
 * @requires numeral
 * @requires moment
 *
 * @returns {Function} handlebars render method, accepting a template and a context
*/

'use strict';

const exphbs = require('express-handlebars');
const numeral = require('numeral');

// this is very cheeky
const moment = require('moment');

const formatDollar = '$0,0.00';
const formatFranc = '0.0,00 FC';

const hbs = exphbs.create({
  helpers : {
    multiply : multiply,
    currency : currency,
    date : date,
    timestamp : timestamp,
    age : age,
    uppercase : uppercase,
    lowercase : lowercase,
    sum : sum
  }
});


function multiply(a, b) {
  return a * b;
}

/** @todo use the currency filter fork written for the client to perform the same behaviour here */
function currency(value, currencyKey) {
  /**@todo this should be driven by currencyKey if provided */
  var formatExpression = formatDollar;

  return numeral(value).format(formatExpression);
}

/**
 * @method date
 *
 * @description
 * This method returns a string date for a particular value, providing the full
 * date in DD/MM/YYYY formatting.
 *
 * @param {Date} value - the date value to be transformed
 * @returns {String} - the formatted string for insertion into templates
 */
function date(value) {
  let date = moment(value);
  return date.isValid() ? date.format('DD/MM/YYYY') :  '';
}

/**
 * @method timestamp
 *
 * @description
 * This method returns the timestamp of a particular value, showing the full date,
 * hours, minutes and seconds associated with the timestamp.
 *
 * @param {Date} value - the date value to be transformed
 * @returns {String} - the formatted string for insertion into templates
 */
function timestamp(value) {
  return moment(value).format('DD/MM/YYYY HH:mm:ss');
}

function age(dob) {
  return moment().diff(dob, 'years');
}

function uppercase(value) {
  return String(value).toUpperCase();
}

function lowercase(value) {
  return String(value).toLowerCase();
}

/**
 * @function sum
 * @desc This function is responsible to calculate the sum of an array given
 * @param {array} array The array of element
 * @param {string} column The column of summation
 * @param {string} ponderation The columne to use as factor of the given column
 * @example
 * // Example with handlebars template
 * // we suppose that `items` is an array of objects
 * // we suppose that `unit_price` is a property of an object in `items` array
 * // we suppose that `quantity` is another property of an object in `items` array
 * {{sum items 'unit_price'}} // will returns only the sum of unit_price value in `items` array
 * {{sum items 'unit_price' 'quantity'}} // will returns the sum of unit_price * quntity value in `items` array
 * `items` <=> array, `unit_price` <=> column, and `quantity` <=> ponderation
 * @return {number} the summation
 */
function sum(array, column, ponderation) {
  ponderation = typeof(ponderation) === 'string' ? ponderation : null;

  if (!array || (array && !array.length)) { return; }

  return array.reduce(function (a, b) {
    return ponderation ? b[column] * b[ponderation] + a : b[column] + a ;
  }, 0);
}

module.exports  = hbs;
