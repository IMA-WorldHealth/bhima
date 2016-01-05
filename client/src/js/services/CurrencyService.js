angular.module('bhima.services')
.service('CurrencyService', CurrencyService);

CurrencyService.$inject = [ '$http', '$q', 'util' ];

function CurrencyService($http, $q, util) {
  var service = this;
  var cache;
  var map;

  service.read = read;
  service.symbol = symbol;
  service.name = namer;

  /* ------------------------------------------------------------------------ */

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

  function symbol(id) {
    return map ? map[id].symbol : '';
  }

  function namer(id) {
    return map ? map[id].name : '';
  }

  return service;
}
