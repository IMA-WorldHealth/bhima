angular.module('bhima.services')
  .service('GeneralLedgerService', GeneralLedgerService);

// Dependencies injection
GeneralLedgerService.$inject = ['PrototypeApiService'];

/**
 * General Ledger Service
 * This service is responsible of all process with the General ledger
 */
function GeneralLedgerService(Api) {
  var service = new Api('/general_ledger/');

  service.accounts = new Api('/general_ledger/accounts');

  return service;
}
