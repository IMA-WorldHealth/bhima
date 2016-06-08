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

  service.read = read;
  service.fiscalYearDate = fiscalYearDate;

  service.create = create;
  service.update = update;
  service.delete = del;

  /**
  * @desc Get an id (optionnal) and return back a list of Fiscal Years or a Fiscal year
  * @param {Integer} id, the id of the Fiscal Year (optionnal) 
  * @return {object} a promise object, with the response.body inside.
  * @example
  * service.read()
  * .then(function (Fiscal Year){
  *   your code here
  *  });
  **/
  function read(id, params) {
    var url = service.url.concat(id || '');
    return $http.get(url, { params : params })
      .then(util.unwrapHttpResponse);
  }

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
  * @desc It create a Fiscal Year
  * @param {object} Fiscal Year, Fiscal Year to create 
  * @example
  * service.create(fiscal)
  * .then(function (res){
  *   your code here
  *  });
  **/
  function create(fiscal) {
    return $http.post('/fiscal/create', fiscal)
      .then(util.unwrapHttpResponse);
  }

  /**
  * @desc It updates a Fiscal Year
  * @param {Integer} id, fiscal Year id to update 
  * @param {object} fiscalYear, fiscalYear to update 
  * @example
  * service.update(id, fiscalYear)
  * .then(function (res){
  *   your code here
  *  });
  **/
  function update(id, fiscalYear) {
    return $http.put('/fiscal/update/'.concat(id), fiscalYear)
      .then(util.unwrapHttpResponse);
  }

  /**
  * @desc It Delete a Fiscal Year
  * @param {Integer} id, Fiscal Year id to delete 
  * @example
  * service.del(id)
  * .then(function (res){
  *   your code here
  *  });
  **/
  function del(id) {
    return $http.delete(service.url + id)
    .then(util.unwrapHttpResponse);
  }

  return service;
}

