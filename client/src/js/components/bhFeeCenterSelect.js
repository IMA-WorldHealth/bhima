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
      validateTrigger  : '<?',
    },
  });

FeeCenterSelectController.$inject = ['FeeCenterService', 'NotifyService'];

/**
 * FeeCenter selection component
 */
function FeeCenterSelectController(FeeCenters, Notify) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {

    FeeCenters.read(null)
      .then((feeCenters) => {
        $ctrl.feeCenters = feeCenters;
        if ($ctrl.filter) {
          $ctrl.feeCenters = feeCenters.filter(center => {
            return $ctrl.principal ? item.is_principal : !item.is_principal;
          });
        }
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = $item => {
    $ctrl.onSelectCallback({ feeCenter : $item });
  };
}
