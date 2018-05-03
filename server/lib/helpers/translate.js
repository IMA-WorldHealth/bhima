/* eslint import/no-dynamic-require: "off", global-require: "off" */
const _ = require('lodash');
const util = require('../util');

// these are resolved at compile time
const dictionaries = {};

/**
 * @function getTranslationHelper
 *
 * @description
 * Returns a compiler function that will translate all text using a dictionary
 *
 * @param {String} languageKey - either 'fr' or 'en'
 */
function getTranslationHelper(languageKey) {
  const key = String(languageKey).toLowerCase() === 'fr' ? 'fr' : 'en';
  const dictionary = util.loadDictionary(key, dictionaries);

  /**
   * @function translate
   *
   * This helper method is responsible for looking up a translation value from
   * a JSON object. It allows the template to specify nested keys a string as follows
   *  'FIRST_CATEGORY.SECOND_CATEGORY.ATTRIBUTE'
   */
  return function translate(translateCode) {
    // lodash's get() method returns an object's value corresponding to the path matched.
    // If the path does not exist, it returns undefined.
    // See https://lodash.com/docs/4.15.0#at
    return _.get(dictionary, translateCode) || translateCode;
  };
}

module.exports = getTranslationHelper;
