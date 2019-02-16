angular.module('bhima.components')
  .component('bhFeeCenterSelect', {
    templateUrl : 'modules/templates/bhFeeCenterSelect.tmpl.html',
    controller  : FeeCenterSelectController,
    transclude  : true,
    bindings    : {
      feeCenterId      : '<',
      filter           : '<',
      principal        : '<',
      onSelectCallback : '&',
      required         : '<?',
    },
  });

FeeCenterSelectController.$inject = ['FeeCenterService', 'NotifyService'];

/**
 * @function FeeCenterSelectionController
 *
 * @description
 * FeeCenter selection component
 */
function FeeCenterSelectController(FeeCenters, Notify) {
  const $ctrl = this;

  $ctrl.$onInit = () => {
    FeeCenters.read(null)
      .then(feeCenters => {

        if ($ctrl.filter) {
          $ctrl.feeCenters = feeCenters
            .filter(item => ($ctrl.principal ? item.is_principal : !item.is_principal));
        } else {
          $ctrl.feeCenters = feeCenters;
        }
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = feeCenter => {
    $ctrl.onSelectCallback({ feeCenter });
  };
}
