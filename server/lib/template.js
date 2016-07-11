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
const en = require('./../../client/i18n/en.json');
const fr = require('./../../client/i18n/fr.json');

const formatDollar = '$0,0.00';
const formatFranc = '0.0,00 FC';

const hbs = exphbs.create({
  helpers : {
    translate : translate,
    multiple : multiply,
    currency : currency,
    date : date,
    timestamp : timestamp,
    age : age,
    uppercase : uppercase,
    lowercase : lowercase
  }
});

/**
 * @function translate
 *
 * This helper method is responsible for looking up a translation value from
 * a JSON object. It allows the template to specify nested keys a string as follows
 *  'FIRST_CATEGORY.SECOND_CATEGORY.ATTRIBUTE'
 */
function translate(translateCode, languageKey) {
  languageKey = languageKey || 'en';

  const initialValue = null;

  if (!translateCode) {
    return;
  }

  const codeList = translateCode.split('.');

  /**
   * This method performs a reduce on a list of object keys and returns the
   * value stored in the object
   */
  function lookupTranslation(a, b) {
    var initialValue = !a;
    let translate;

    if (initialValue) {
      // translate to French if given else use English as default
      translate = languageKey === 'fr' ? fr : en;

      return translate[b];
    } else {
      // nested value (not initial), select from the comparison object
      return a[b];
    }
  }

  return codeList.reduce(lookupTranslation, initialValue) || translateCode;
}

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

module.exports  = hbs;
