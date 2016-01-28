/**
 * The Cash Payments Controller
 *
 * This controller is responsible for binding the cash payments controller to
 * its view.  Cash payments can be made against future invocies (cautions) or
 * against previous invoices (sales).  The cash payments module provides
 * functionality to pay both in multiple currencies.
 *
 * @todo documentation improvements
 *
 * @module bhima/controllers/CashboxSelectController
 */
angular.module('bhima.controllers')
.controller('CashboxSelectController', CashboxSelectController);

CashboxSelectController.$inject = [
  'CashboxService', 'appcache', '$location'
];

function CashboxSelectController(Cashboxes, AppCache, $location) {

  // bind controller alias
  var vm = this;
  var cache = new AppCache('CashPayments');

  // bind data
  vm.loadingState = true;

  // bind methods
  vm.selectCashbox = selectCashbox;
  vm.refreshCashboxList = refreshCashboxList;

  /* ------------------------------------------------------------------------ */

  function handler(error) {
    throw error;
  }

  // loads a new set of cashboxes from the server.
  function refreshCashboxList() {
    Cashboxes.read()
    .then(function (cashboxes) {
      vm.cashboxes = cashboxes;
    })
    .catch(handler)
    .finally(function () {
      vm.loadingState = true;
    });
  }

  // fired when a user selects a cashbox from a list
  function selectCashbox(id) {
    Cashboxes.read(id)
    .then(function (cashbox) {
      vm.cashbox = cashbox;
      return cache.put('cashbox', cashbox);
    })
    .then(function () {
      navigate(vm.cashbox.id);
    })
    .catch(handler);
  }

  // expects a cashbox id as the first parameter
  function navigate(id) {
    var path = $location.path() + '/' + id;
    $location.url(path);
  }

  // fired on controller load
  function startup() {

    // look up cashbox from local storage
    cache.fetch('cashbox')
    .then(function (cashbox) {

      // if a cashbox exists, go to it!
      if (cashbox) {
        navigate(cashbox.id);

      // otherwise, load a list to be displayed to the client
      } else {
        return refreshCashboxList();
      }
    })
    .catch(handler);
  }

  // start up the module
  startup();
}

