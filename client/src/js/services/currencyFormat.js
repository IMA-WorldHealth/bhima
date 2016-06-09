/**
 * @description
 * Provides asynchronous GET requests for currency configuration files, fetched
 * configurations are cached and served directly to subsequent requests.
 *
 * @returns {object} Wrapper object exposing request configuration method
 */
angular.module('bhima.services')
.factory('currencyFormat', currencyFormat);

currencyFormat.$inject = [
  'CurrencyService', '$http', 'Store'
];

function currencyFormat(Currencies, $http, Store) {
  var currencyConfigurationPath = '/i18n/currency/';
  var loadedSupportedCurrencies = false;
  var supportedCurrencies = new Store({identifier : 'id'});
  var currentFormats = new Store({identifier : 'format_key'});
  var fetchingKeys = [];
  var invalidCurrency = { supported : false };

  // Request all defined BHIMA currencies
  Currencies.read()
  .then(function (currencies) {
    supportedCurrencies.setData(currencies);
    loadedSupportedCurrencies = true;

    // automatically load all currency formats at startup
    currencies.forEach(function (currency) {
      searchFormatConfiguration(currency.id);
    });
  });

  // Requests individual currency configurations
  function fetchFormatConfiguration(key) {
    var formatObject = null;
    fetchingKeys[key] = true;

    $http.get(currencyConfigurationPath.concat(key, '.json'))
      .then(function (response) {

        // Add configuration to local cache
        formatObject = response.data;
        formatObject.supported = true;
        formatObject.format_key = key;
        addFormat(formatObject);
      })
      .catch(function (err) {

        // Deny future attempts to request this configuration
        formatObject = invalidCurrency;
        formatObject.format_key = key;
        addFormat(formatObject);
      });
  }

  function addFormat(formatObject) {
    currentFormats.post(formatObject);
  }

  /**
   * @param {number} currencyId ID of currency to be checked against BHIMA's database
   *
   * @returns {object} Returns format configuration if it has been found and fetched,
   * objects reporting unsupported status if configuration or currency cannot be found
   */
  function searchFormatConfiguration(currencyId) {
    var supportedCurrency = supportedCurrencies.get(currencyId);

    if (angular.isUndefined(supportedCurrency)) {
      return invalidCurrency;
    }

    // currency has been identified - search for configuration
    var formatKey = supportedCurrency.format_key;
    var progress = fetchingKeys[formatKey];

    // initial for request for currency with this key - initialise configuration request
    if (!angular.isDefined(progress)) {
      fetchFormatConfiguration(formatKey);
    }

    return currentFormats.get(formatKey);
  }

  /**
   * @returns {boolean} Exposes status of initial currency index cache request
   */
  function reportStatus() {
    return loadedSupportedCurrencies;
  }

  return {
    request : searchFormatConfiguration,
    indexReady : reportStatus
  };
}
