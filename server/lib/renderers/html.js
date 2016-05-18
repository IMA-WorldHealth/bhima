var exhbs       = require('express-handlebars');

/** @todo use the currency filter fork written for the client to perform the same behaviour here */
var numeral     = require('numeral');
var formatDollar = '$0,0.00';
var formatFranc = '0.0,00 FC';

exports.render = renderHTML;

var hbs = exhbs.create({
  helpers : {
    translate : translate,
    multiple : multiply,
    currency : currency
  }
});

var en = require('./../../../client/i18n/en.json');

/** @todo move to exhbs library file */
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

function renderHTML(data, template) {

  // assume that this is passed in precompiled
  return hbs.render(template, data);
}
