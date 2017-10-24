angular.module('bhima.controllers')
  .controller('SelectCashboxModalController', SelectCashboxModalController);

SelectCashboxModalController.$inject = [
  'SessionService', '$uibModalInstance', 'CashboxService', '$stateParams',
  'NotifyService',
];

/**
 * This modal selects the active cashbox on the cash page
 */
function SelectCashboxModalController(Session, Instance, Cashboxes, $stateParams, Notify) {
  var vm = this;

  var cashboxId = $stateParams.id;
  vm.cashboxId = cashboxId;
  vm.selectCashbox = selectCashbox;

  /* ------------------------------------------------------------------------ */

  // loads a new set of cashboxes from the server.
  function startup() {
    toggleLoadingIndicator();
    Cashboxes.read(undefined, { is_auxiliary : 1 })
      .then(function (cashboxes) {
        vm.cashboxes = cashboxes;

        vm.currentProjectCashboxes = cashboxes.filter(function (cashbox) {
          return cashbox.project_id === Session.project.id;
        });

        vm.otherProjectCashboxes = cashboxes.filter(function (cashbox) {
          return cashbox.project_id !== Session.project.id;
        });

        // convenience variables to clean up view logic
        vm.hasCurrentProjectCashboxes = vm.currentProjectCashboxes.length > 0;
        vm.hasOtherProjectCashboxes = vm.otherProjectCashboxes.length > 0;

        if (cashboxId) {
          selectCashbox(cashboxId);
        }
      })
      .catch(Notify.handleError)
      .finally(toggleLoadingIndicator);
  }

  // fired when a user selects a cashbox from a list
  function selectCashbox(id) {
    var selected;

    vm.cashboxes.forEach(function (box) {
      if (box.id === id) {
        selected = box;
      }
    });

    vm.selectedCashbox = selected;
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  // start up the module
  startup();
}
