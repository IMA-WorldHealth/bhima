angular.module('bhima.services')
  .service('DonationService', DonationService);

DonationService.$inject = ['PrototypeApiService'];

/**
 * Role Service
 *
 * A service wrapper for the /donors HTTP endpoint.
 *
 */
function DonationService(Api) {
  const service = new Api('/donations/');
  service.stockBalance = stockBalance;

  function stockBalance(id) {
    const url = ''.concat(id, '/stock_balance');
    return Api.read.call(service, url);
  }

  return service;
}
