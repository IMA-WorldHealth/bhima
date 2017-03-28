angular.module('bhima.services')
  .service('CashboxService', CashboxService);

CashboxService.$inject = [ '$http', 'util' ];

/**
* Cashbox Service
*
* This service communicates with both the backend cashboxes API and the cashbox
* currency API for manipulating cashboxes.  Cashbox-currency methods are
* exposed behind the service.currencies.* functions.
*/
function CashboxService($http, util) {
  var service = this;
  var baseUrl = '/cashboxes/';

  // expose service methods to the client for consumption
  service.read = read;
  service.create = create;
  service.update = update;
  service.delete = del;

  // cashbox-currency methods
  service.currencies = {};
  service.currencies.read = readCurrencies;
  service.currencies.create = createCurrencies;
  service.currencies.update = updateCurrencies;

  function read(id, params) {
    var url = baseUrl.concat(id || '');
    return $http.get(url, { params: params })
      .then(util.unwrapHttpResponse);
  }

  function create(box) {
    delete box.currencies;
    delete box.type;
    return $http.post(baseUrl, { cashbox: box })
      .then(util.unwrapHttpResponse);
  }

  // update a cashbox in the database
  function update(id, box) {

    // remove box props that shouldn't be submitted to the server
    delete box.id;
    delete box.type;
    delete box.currencies;

    return $http.put(baseUrl.concat(id), box)
      .then(util.unwrapHttpResponse);
  }

  // DELETE a cashbox in the database
  function del(id) {
    return $http.delete(baseUrl.concat(id))
      .then(util.unwrapHttpResponse);
  }

  // this will read either all cashbox currency accounts or a specific
  // cashbox currency account.
  function readCurrencies(id, currencyId) {
    var url = baseUrl + id + '/currencies/';

    // attach the currencyId if it exists
    url =  url.concat(currencyId || '');

    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  function createCurrencies(id, data) {
    var url = baseUrl + id + '/currencies';
    return $http.post(url, data)
      .then(util.unwrapHttpResponse);
  }

  function updateCurrencies(cashboxId, data) {
    var currencyId = data.currency_id;
    var url = baseUrl + cashboxId + '/currencies/' + currencyId;

    // delete potentially duplicate data entries
    delete data.currency_id;
    delete data.id;

    return $http.put(url, data)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
