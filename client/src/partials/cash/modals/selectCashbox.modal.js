angular.module('bhima.controllers')
.controller('SelectCashboxModalController', SelectCashboxModalController);

SelectCashboxModalController.$inject = [
  'SessionService', '$uibModalInstance', 'CashboxService',
  'AppCache', 'cashboxId'
];

/**
 * This modal selects the active cashbox on the cash page
 */
function SelectCashboxModalController(Session, Instance, Cashboxes, AppCache, cashboxId) {

  /** @const view-model alias */
  var vm = this;
  var cache = AppCache('CashPayments');

  vm.selectCashbox = selectCashbox;
  vm.dismiss = dismiss;
  vm.close   = close;
  vm.cashboxId = cashboxId;

  /* ------------------------------------------------------------------------ */

  function handler(error) {
    throw error;
  }

  // loads a new set of cashboxes from the server.
  function startup() {
    Cashboxes.read(undefined, {
      project_id : Session.project.id,
      is_auxiliary: 1
    })
    .then(function (cashboxes) {
      vm.cashboxes = cashboxes;
    })
    .catch(handler);
  }

  // fired when a user selects a cashbox from a list
  function selectCashbox(id) {
    Cashboxes.read(id)
    .then(function (cashbox) {
      cache.cashbox = cashbox;
      vm.selectedCashbox = cashbox;
    })
    .catch(handler);
  }

  function close() {
    Instance.close(vm.selectedCashbox);
  }

  function dismiss() {
    Instance.dismiss('cancel');
  }

  // start up the module
  startup();
}
