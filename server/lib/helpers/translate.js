const en = require('../../../client/i18n/en.json');
const fr = require('../../../client/i18n/fr.json');

/**
 * @function getTranslationHelper
 *
 * @param {String} languageKey - either
 */
function getTranslationHelper(languageKey) {

  /**
   * @function translate
   *
   * This helper method is responsible for looking up a translation value from
   * a JSON object. It allows the template to specify nested keys a string as follows
   *  'FIRST_CATEGORY.SECOND_CATEGORY.ATTRIBUTE'
   */
  return function translate(translateCode) {

    // set the translate keys database with English as default
    let translate = languageKey === 'fr' ? fr : en;


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
        // translate to French if given else use English as default
        return translate[b];
      } else {
        // nested value (not initial), select from the comparison object
        return a[b];
      }
    }

    return codeList.reduce(lookupTranslation, initialValue) || translateCode;
  };
}


module.exports = getTranslationHelper;
