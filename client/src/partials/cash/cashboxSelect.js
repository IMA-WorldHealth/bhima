angular.module('bhima.controllers')
.controller('CashboxSelectController', CashboxSelectController);

CashboxSelectController.$inject = [
  'CashboxService', 'appcache', '$state', 'Notify'
];

/**
 * The Cashbox Selection Controller
 *
 * This controller is responsible for selecting a cashbox from all available
 * cashboxes before routing the client page to the CashController module.
 *
 * @module bhima/controllers/CashboxSelectController
 * @constructor
 */
function CashboxSelectController(Cashboxes, AppCache, $state, Notify) {
  var vm = this;

  // NOTE: this should be the same as the cash window controller
  var cache = AppCache('CashPayments');

  // bind methods
  vm.selectCashbox = selectCashbox;
  vm.refreshCashboxList = refreshCashboxList;

  /* ------------------------------------------------------------------------ */

  // loads a new set of cashboxes from the server.
  function refreshCashboxList() {
    vm.loading = true;

    Cashboxes.read()
    .then(function (cashboxes) {
      vm.cashboxes = cashboxes;
    })
    .catch(Notify.handleError)
    .finally(toggleLoadingIndicator);
  }

  // fired when a user selects a cashbox from a list
  function selectCashbox(id) {
    Cashboxes.read(id)
    .then(function (cashbox) {
      vm.cashbox = cashbox;
      cache.cashbox = cashbox;

      // go to the cash window
      $state.$go('^.window');
    })
    .catch(Notify.handleError);
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  refreshCashboxList();
}
