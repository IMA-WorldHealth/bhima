angular.module('bhima.services')
.service('FiscalService', FiscalService);

FiscalService.$inject = [ 'PrototypeApiService' ];

/**
 * @class FiscalService
 * @extends PrototypeApiService
 *
 * This service is responsible for loading the Fiscal Years and Periods, as well
 * as providing metadata like period totals, opening balances and such.
 *
 * @requires PrototypeApiService
 */
function FiscalService(Api) {

  // extend the PrototypeApiService with fiscal routes
  var service = new Api('/fiscal/');

  // TODO - rename this something like 'byDate()'
  service.fiscalYearDate = fiscalYearDate;

  /**
   * @method fiscalYearDate
   *
   * @description
   * Find the fiscal year for a given date.
   */
  function fiscalYearDate(params) {
    var url = service.url.concat('date');

    return service.$http.get(url, { params : params })
      .then(service.util.unwrapHttpResponse);
  }

  return service;
}

