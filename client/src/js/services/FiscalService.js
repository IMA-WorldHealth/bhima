angular.module('bhima.services')
.service('FiscalService', FiscalService);

FiscalService.$inject = ['PrototypeApiService', '$http', 'util'];

/**
 * @class FiscalService
 * @extends PrototypeApiService
 *
 * This service is responsible for loading the Fiscal Years and Periods, as well
 * as providing metadata like period totals, opening balances and such.
 *
 * @requires PrototypeApiService
 */
function FiscalService(PrototypeApiService, $http, util) {
  var service = this;

  // inherit from the PrototypeApiService
  angular.extend(service, PrototypeApiService);

  // the service URL
  service.url = '/fiscal/';
  service.fiscalYearDate = fiscalYearDate;
  service.create = create;


  /**
  * To get a Fiscal Year by Date
  *
  **/
  function fiscalYearDate(params) {
    var url = service.url.concat('date');
        
    return $http.get(url, { params : params })
      .then(util.unwrapHttpResponse);
  }

  /**
   * Wraps the prototype create method.
   */
  function create(fiscal) {
    return PrototypeApiService.create.call(service, fiscal);
  }  

  return service;
}

