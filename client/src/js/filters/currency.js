/**
 * BHIMA fork of angular's native currency filter.
 * Allows currency to be defined for each filter individually.
 * Currency IDs are used to fetch configuration files asynchronously from the server.
 * Completely separates locale from currency format to facilitate reliable accounting.
 * Clearly fails given an unsupported currency ID or configuration.
 *
 * @param {number} amount Value to be converted into currency
 * @param {number} currencyId ID for
 * @returns {string} Valid supported currency or error string
 */

angular.module('bhima.filters')
  .filter('currency', CurrencyFilter);

CurrencyFilter.$inject = [
  'currencyFormat', 'SessionService',
];


function CurrencyFilter(CurrencyFormat, Session) {
  var requireCurrencyDefinition = false;

  function currencyFilter(amount, currencyId) {
    var formatConfiguration;
    var amountUndefined = angular.isUndefined(amount) || angular === null;

    if (angular.isUndefined(currencyId)) {

      if (requireCurrencyDefinition) {
        return formatError('INVALID_CURRENCY_DEFINITION', amount);
      } else {

        // Display enterprise currency unless otherwise specified
        currencyId = Session.enterprise.currency_id;
      }
    }

    // Terminate early to reduce calculations for ill formed requests
    if (amountUndefined) {
      return null;
    }

    // Currency cache has not yet retrieved available currency index
    if (!CurrencyFormat.indexReady()) {
      return null;
    }

    formatConfiguration = CurrencyFormat.request(currencyId);

    // No configuration found - definition is probably being fetched
    if (angular.isUndefined(formatConfiguration)) {
      return null;
    }

    // Currency ID did not match a currency ID or format configuration was not found
    if (!formatConfiguration.supported) {
      return formatError('CURRENCY_NOT_SUPPORTED', amount);
    }

    return formatNumber(amount, formatConfiguration.PATTERNS[1], formatConfiguration.GROUP_SEP, formatConfiguration.DECIMAL_SEP)
      .replace(/\u00A4/g, formatConfiguration.CURRENCY_SYM);
  }

  // utility methods
  function formatError(message, amount) {
    return message.concat('(', amount, ')');
  }

  // Formatting method directly from angular native filter - does not support BHIMA coding guidelines
  var DECIMAL_SEP = '.';
  function formatNumber(number, pattern, groupSep, decimalSep, fractionSize) {
    if (angular.isObject(number)) return '';

    var isNegative = number < 0;
    number = Math.abs(number);

    var isInfinity = number === Infinity;
    if (!isInfinity && !isFinite(number)) return '';

    var numStr = number + '',
        formatedText = '',
        hasExponent = false,
        parts = [];

    if (isInfinity) formatedText = '\u221e';

    if (!isInfinity && numStr.indexOf('e') !== -1) {
      var match = numStr.match(/([\d\.]+)e(-?)(\d+)/);
      if (match && match[2] == '-' && match[3] > fractionSize + 1) {
        number = 0;
      } else {
        formatedText = numStr;
        hasExponent = true;
      }
    }

    if (!isInfinity && !hasExponent) {
      var fractionLen = (numStr.split(DECIMAL_SEP)[1] || '').length;

      // determine fractionSize if it is not specified
      if (angular.isUndefined(fractionSize)) {
        fractionSize = Math.min(Math.max(pattern.minFrac, fractionLen), pattern.maxFrac);
      }

      // safely round numbers in JS without hitting imprecisions of floating-point arithmetics
      // inspired by:
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
      number = +(Math.round(+(number.toString() + 'e' + fractionSize)).toString() + 'e' + -fractionSize);

      var fraction = ('' + number).split(DECIMAL_SEP);
      var whole = fraction[0];
      fraction = fraction[1] || '';

      var i, pos = 0,
          lgroup = pattern.lgSize,
          group = pattern.gSize;

      if (whole.length >= (lgroup + group)) {
        pos = whole.length - lgroup;
        for (i = 0; i < pos; i++) {
          if ((pos - i) % group === 0 && i !== 0) {
            formatedText += groupSep;
          }
          formatedText += whole.charAt(i);
        }
      }

      for (i = pos; i < whole.length; i++) {
        if ((whole.length - i) % lgroup === 0 && i !== 0) {
          formatedText += groupSep;
        }
        formatedText += whole.charAt(i);
      }

      // format fraction part.
      while (fraction.length < fractionSize) {
        fraction += '0';
      }

      if (fractionSize && fractionSize !== '0') { formatedText += decimalSep + fraction.substr(0, fractionSize); }
    } else {
      if (fractionSize > 0 && number < 1) {
        formatedText = number.toFixed(fractionSize);
        number = parseFloat(formatedText);
      }
    }

    if (number === 0) {
      isNegative = false;
    }

    parts.push(isNegative ? pattern.negPre : pattern.posPre,
               formatedText,
               isNegative ? pattern.negSuf : pattern.posSuf);
    return parts.join('');
  }

  currencyFilter.$stateful = true;

  return currencyFilter;
}
