angular.module('bhima.controllers')
.controller('SelectCashboxModalController', SelectCashboxModalController);

SelectCashboxModalController.$inject = [
  'SessionService', '$uibModalInstance', 'CashboxService', '$stateParams',
  'NotifyService'
];

/**
 * This modal selects the active cashbox on the cash page
 */
function SelectCashboxModalController(Session, Instance, Cashboxes, $stateParams, Notify) {
  var vm = this;

  vm.selectCashbox = selectCashbox;
  var cashboxId = vm.cashboxId = $stateParams.id;

  /* ------------------------------------------------------------------------ */

  // loads a new set of cashboxes from the server.
  function startup() {

    toggleLoadingIndicator();

    Cashboxes.read(undefined, {
      project_id : Session.project.id,
      is_auxiliary : 1
    })
      .then(function (cashboxes) {
        vm.cashboxes = cashboxes;

        if (cashboxId) {
          selectCashbox(cashboxId);
        }
      })
      .catch(Notify.handleError)
      .finally(toggleLoadingIndicator);
  }

  // fired when a user selects a cashbox from a list
  function selectCashbox(id) {
    vm.selectedCashbox = vm.cashboxes.reduce(function (selected, box) {
      if (box.id === id) { selected = box; }
      return selected;
    }, null);
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  // start up the module
  startup();
}
