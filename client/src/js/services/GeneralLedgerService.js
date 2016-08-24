angular.module('bhima.services')
  .service('GeneralLedgerService', GeneralLedgerService);

// Dependencies injection
GeneralLedgerService.$inject = ['$http', 'util'];

/**
 * General Ledger Service
 * This service is responsible of all process with the General ledger
 */
function GeneralLedgerService($http, util) {
  'use strict';

  var service = this;

  const baseUrl = '/general_ledger/';

  // expose the services method's
  service.read = read;

  /** Getting general ledger data */
  function read() {
    return $http.get(baseUrl)
      .then(util.unwrapHttpResponse);
  }
}
