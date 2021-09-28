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
      label            : '@?',
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

  function loadCostCenters() {
    CostCenters.read()
      .then(costCenters => {
        $ctrl.costCenters = $ctrl.filter
          ? costCenters.filter(item => ($ctrl.principal ? item.is_principal : !item.is_principal))
          : costCenters;
      })
      .catch(Notify.handleError);
  }

  $ctrl.$onInit = () => {
    $ctrl.label = $ctrl.label || 'COST_CENTER.TITLE';
    $ctrl.costCenterId = +$ctrl.costCenterId;
    loadCostCenters();
  };

  $ctrl.$onChanges = (changes) => {
    if (changes.costCenterId && changes.costCenterId.currentValue) {
      loadCostCenters();
    }
  };

  $ctrl.onSelect = costCenter => {
    $ctrl.onSelectCallback({ costCenter });
  };
}
