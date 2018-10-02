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
    $ctrl.loading = true;

    FeeCenters.read(null)
      .then((feeCenters) => {
        $ctrl.feeCenters = feeCenters;

        if ($ctrl.filter) {
          if ($ctrl.principal) {
            $ctrl.feeCenters = feeCenters.filter(item => {
              return item.is_principal;
            });
          } else {
            $ctrl.feeCenters = feeCenters.filter(item => {
              return !item.is_principal;
            });
          }
        }
      })
      .catch(Notify.handleError)
      .finally(() => {
        $ctrl.loading = false;
      });
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = $item => {
    $ctrl.onSelectCallback({ feeCenter : $item });
  };
}
