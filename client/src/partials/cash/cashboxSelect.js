angular.module('bhima.controllers')
.controller('CashboxSelectController', CashboxSelectController);

CashboxSelectController.$inject = [
  'CashboxService', 'appcache', '$location'
];

/**
 * The Cashbox Selection Controller
 *
 * This controller is responsible for selecting a cashbox from all available
 * cashboxes before routing the client page to the CashController module.
 *
 * @module bhima/controllers/CashboxSelectController
 * @constructor
 *
 * @todo Migrate this code to an angular.component().
 * @todo Use toggleLoadingState() to govern loading.
 */
function CashboxSelectController(Cashboxes, AppCache, $location) {

  /** @const view-model alias */
  var vm = this;

  /**
  * @const persistent cashbox store
  * This should be the same as in CashController
  */
  var cache = new AppCache('CashPayments');

  /** ui loading indicator control */
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
