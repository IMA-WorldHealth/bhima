angular.module('bhima.services')
.service('GeneralLedgerService', GeneralLedgerService);

GeneralLedgerService.$inject = [
  '$http', '$q', 'messenger', 'store'
];

/**
* General Ledger Service
*
* Allows data to be loaded for the general ledger, and supports caching.
*/
function GeneralLedgerService($http, $q, messenger, Store) {
  'use strict';

  var service = this;
  var cache = new Store({ identifier : 'uuid', data : [] });

  service.load = load;

  /* ------------------------------------------------------------------------ */

  // loads based on options
  function load(options, reload) {
    var promise;
    var refresh = cache.data.length === 0 || reload;

    // should we reload or fetch data for the first time?
    if (refresh) {
      promise = $http.get('/ledgers/general', { params : options })
      .then(function (response) {
        cache.setData(response.data);
        return cache;
      });
    // if we have local data, simply return it.
    } else {
      promise = $q.resolve(cache);
    }

    return promise;
  }

  return service;
}
