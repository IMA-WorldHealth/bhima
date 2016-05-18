angular.module('bhima.controllers')
.controller('SelectCashboxModalController', SelectCashboxModalController);

SelectCashboxModalController.$inject = [
  'SessionService', '$uibModalInstance', 'CashboxService',
  '$location', 'AppCache', 'cashboxId'
];

function SelectCashboxModalController(Session, Instance, Cashboxes, $location, AppCache, CashboxId) {

  /** @const view-model alias */
  var vm = this;

  var cache = AppCache('CashPayments');

  vm.selectCashbox = selectCashbox;
  vm.dismiss = dismiss;
  vm.close   = close;
  vm.cashboxId = CashboxId;

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
  function selectCashbox(id, index) {
    Cashboxes.read(id)
    .then(function (cashbox) {
      vm.indexSelected = index;
      vm.selectedCashbox = cashbox;
      cache.cashbox = cashbox;
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
