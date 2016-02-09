angular.module('bhima.services')
.service('CurrencyService', CurrencyService);

CurrencyService.$inject = [ '$http', '$q', 'util' ];

/**
* Currency Service
*
* This service is responsible for reading currencies from the database.  It
* maintains a local cache so that currencies are not fetched multiple times.
*
* @module services/CurrencyService
*/
function CurrencyService($http, $q, util) {
  var service = this;
  var cache;
  var map;

  /** read (and cache) currencies from the database */
  service.read = read;

  /** get the symbol for a currency by id */
  service.symbol = symbol;

  /** get the name for a currency by id */
  service.name = namer;

  /** get a nicely formatted label for a currency by id */
  service.format = format;

  /* ------------------------------------------------------------------------ */

  /**
   * Reads currencies from the database.  The results of the first request are
   * cached in a local cache so that future requests do not have to make an
   * additional HTTP request.
   *
   * @method read
   * @returns {Promise} A list of currencies from the database.
   */
  function read() {

    // if we have currencies cached, return them directly
    if (cache) { return $q.resolve(cache); }

    return $http.get('/finance/currencies')
    .then(util.unwrapHttpResponse)
    .then(function (currencies) {

      // cache currencies to avoid future HTTP lookups.
      cache = currencies;
      map = buildMap(currencies);

      return cache;
    });
  }

  function buildMap(currencies) {
    return currencies.reduce(function (map, row) {
      if (!map[row.id]) { map[row.id] = row; }
      return map;
    }, {});
  }

  /**
   * Returns the symbol associated with a given currency.
   *
   * @method symbol
   * @param {Number} id - the currency id to look up
   * @returns {String} The symbol associated with the currency or an empty string
   */
  function symbol(id) {
    return map ? map[id].symbol : '';
  }

  /**
   * Returns the symbol associated with a given currency.
   *
   * @method symbol
   * @param {Number} id - the currency id to look up
   * @returns {String} The symbol associated with the currency or an empty string
   */
  function namer(id) {
    return map ? map[id].name : '';
  }

  /**
   * Returns a nicely formatted label associated with a given currency by id.
   *
   * @method format
   * @param {Number} id - the currency id to look up
   * @returns {String} A label associated with the currency or an empty string
   */
  function format(id) {
    return namer(id) + ' (' + symbol(id) + ')';
  }

  return service;
}
