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
  var cache = AppCache('CashPayments');

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
      cache.cashbox = cashbox;
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

    if (cache.cashbox) {
      navigate(cache.cashbox.id);
    } else {
      refreshCashboxList();
    }
  }

  // start up the module
  startup();
}
