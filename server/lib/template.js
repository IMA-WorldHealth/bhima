/**
 * @description 
 * This service is a wrapper for the express handlebars library. It sets the required configuration options and provides
 * a number of helper methods that are exposed to templates. 
 * - translate - convert a translation key into the current languages text 
 * - multiply - multiply two numbers together 
 * - currency - convert a number into a currency string based on currently selected currency
 * 
 * @requires express-handlebars
 * @requires numeral
 * 
 * @returns {Function} handlebars render method, accepting a template and a context
*/
const exphbs = require('express-handlebars');
const numeral = require('numeral');

const en = require('./../../client/i18n/en.json');

const formatDollar = '$0,0.00';
const formatFranc = '0.0,00 FC';

const hbs = exphbs.create({
  helpers : {
    translate : translate,
    multiple : multiply,
    currency : currency
  }
});

/**
 * This helper method is responsible for looking up a translation value from
 * a JSON object. It allows the template to specify nested keys a string as follows
 *  'FIRST_CATEGORY.SECOND_CATEGORY.ATTRIBUTE'
 */
function translate(translateCode, languageKey) {
  const DEFAULT_LANG = 'en';

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

    if (initialValue) {
      // lookup the value from the reference object
      return en[b];
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

module.exports  = hbs;
