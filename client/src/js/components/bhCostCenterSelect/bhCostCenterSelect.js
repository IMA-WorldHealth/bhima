angular.module('bhima.components')
  .component('bhCostCenterSelect', {
    templateUrl : 'js/components/bhCostCenterSelect/bhCostCenterSelect.html',
    controller  : CostCenterSelectController,
    transclude  : true,
    bindings    : {
      costCenterId     : '<',
      filter           : '<',
      principal        : '<',
      onSelectCallback : '&',
      required         : '<?',
      disabled         : '<?',
    },
  });

CostCenterSelectController.$inject = ['CostCenterService', 'NotifyService'];

/**
 * @function CostCenterSelectionController
 *
 * @description
 * CostCenter selection component
 */
function CostCenterSelectController(CostCenters, Notify) {
  const $ctrl = this;

  function loadCostCenters(ccId) {
    CostCenters.read()
      .then(costCenters => {
        $ctrl.costCenters = $ctrl.filter
          ? costCenters.filter(item => ($ctrl.principal ? item.is_principal : !item.is_principal))
          : costCenters;

        if (ccId) {
          $ctrl.disabled = true;
        }
      })
      .catch(Notify.handleError);
  }

  $ctrl.$onInit = () => {
    $ctrl.costCenterId = +$ctrl.costCenterId;
    loadCostCenters();
  };

  $ctrl.$onChanges = (changes) => {
    if (changes.costCenterId && changes.costCenterId.currentValue) {
      loadCostCenters(changes.costCenterId.currentValue);
    }
  };

  $ctrl.onSelect = costCenter => {
    $ctrl.onSelectCallback({ costCenter });
  };
}
