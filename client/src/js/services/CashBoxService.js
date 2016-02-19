angular.module('bhima.services')
.service('CashboxService', CashboxService);

CashboxService.$inject = [ '$http', 'util' ];

/**
* Cashbox Service
*
* @todo documenation updates to use JSDoc standards
*/
function CashboxService($http, util) {
  var service = {};

  service.read = read;
  service.filteredRead = filteredRead;
  service.create = create;
  service.update = update;
  service.delete = del;
  service.currencies = {};
  service.currencies.read = readCurrencies;
  service.currencies.create = createCurrencies;
  service.currencies.update = updateCurrencies;


  /* ------------------------------------------------------------------------ */



  function read(id) {
    var url = (id) ? '/cashboxes/' + id : '/cashboxes';
    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  function filteredRead (filter) {
    var url = '/cashboxes' + filter;
    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  function create(box) {
    return $http.post('/cashboxes', { cashbox: box })
      .then(util.unwrapHttpResponse);
  }

  function update(id, box) {

    // remove box props that shouldn't be submitted to the server
    delete box.id;
    delete box.type;
    delete box.currencies;

    return $http.put('/cashboxes/' + id, box)
      .then(util.unwrapHttpResponse);

  }

  function del(id) {
    return $http.delete('/cashboxes/' + id)
      .then(util.unwrapHttpResponse);
  }

  // this will read either all cashbox currency accounts or a specific
  // cashbox currency account.
  function readCurrencies(id, currencyId) {
    var url = '/cashboxes/' + id + '/currencies';

    // attache the currencyId if it exists
    if (currencyId) { url += '/' + currencyId; }

    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  function createCurrencies(id, data) {
    var url = '/cashboxes/' + id + '/currencies';
    return $http.post(url, data)
      .then(util.unwrapHttpResponse);
  }

  function updateCurrencies(cashboxId, data) {
    var currencyId = data.currency_id;
    var url = '/cashboxes/' + cashboxId + '/currencies/' + currencyId;

    // delete potentially duplicate data entries
    delete data.currency_id;
    delete data.id;

    return $http.put(url, data)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
