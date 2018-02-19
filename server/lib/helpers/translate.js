/* eslint import/no-dynamic-require: "off", global-require: "off" */
const _ = require('lodash');

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
  const dictionary = loadDictionary(key);

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

/**
 * @function loadDictionary
 *
 * @description
 * Either returns a cached version of the dictionary, or loads the dictionary
 * into the cache and returns it.
 *
 * @param {String} key - either 'fr' or 'en'
 */
function loadDictionary(key) {
  const dictionary = dictionaries[key];
  if (dictionary) { return dictionary; }

  dictionaries[key] = require(`../../../client/i18n/${key}.json`);
  return dictionaries[key];
}

module.exports = getTranslationHelper;
