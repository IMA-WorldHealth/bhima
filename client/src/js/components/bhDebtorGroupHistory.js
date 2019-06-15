angular.module('bhima.components')
  .component('bhDebtorGroupHistory', {
    templateUrl : 'modules/templates/bhDebtorGroupHistory.tmpl.html',
    controller : bhDebtorGroupHistoryController,
    transclude : true,
    bindings : {
      debtorUuid : '<',
      limit : '@?',
    },
  });

bhDebtorGroupHistoryController.$inject = ['DebtorGroupService', 'NotifyService'];
/**
 * Debtor group history component
 *
 */
function bhDebtorGroupHistoryController(DebtorGroup, Notify) {
  const $ctrl = this;

  // fired at the beginning
  $ctrl.$onInit = () => {
    $ctrl.limit = $ctrl.limit || 5;
    loadHistory();
  };

  $ctrl.$onChanges = () => {
    loadHistory();
  };

  function loadHistory() {
    const parameters = { limit : $ctrl.limit };
    DebtorGroup.history($ctrl.debtorUuid, parameters)
      .then(groupChanges => {
        $ctrl.groupChanges = groupChanges;
      })
      .catch(Notify.handleError);
  }
}
