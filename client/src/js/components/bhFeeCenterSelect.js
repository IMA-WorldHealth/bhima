angular.module('bhima.components')
  .component('bhCostCenterSelect', {
    templateUrl : 'modules/templates/bhCostCenterSelect.tmpl.html',
    controller  : CostCenterSelectController,
    transclude  : true,
    bindings    : {
      costCenterId      : '<',
      filter           : '<',
      principal        : '<',
      onSelectCallback : '&',
      required         : '<?',
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

  $ctrl.$onInit = () => {
    CostCenters.read(null)
      .then(costCenters => {

        if ($ctrl.filter) {
          $ctrl.costCenters = costCenters
            .filter(item => ($ctrl.principal ? item.is_principal : !item.is_principal));
        } else {
          $ctrl.costCenters = costCenters;
        }
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = costCenter => {
    $ctrl.onSelectCallback({ costCenter });
  };
}
