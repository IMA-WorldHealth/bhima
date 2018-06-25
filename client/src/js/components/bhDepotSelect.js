angular.module('bhima.components')
  .component('bhDepotSelect', {
    templateUrl : 'modules/templates/bhDepotSelect.tmpl.html',
    controller  : DepotSelectController,
    transclude  : true,
    bindings    : {
      depotUuid        : '<',
      onSelectCallback : '&',
      required         : '<?',
      validateTrigger  : '<?',
    },
  });

DepotSelectController.$inject = ['DepotService', 'NotifyService'];

/**
 * Depot selection component
 */
function DepotSelectController(Depots, Notify) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    $ctrl.loading = true;

    // load all depots
    Depots.read(null)
      .then((depots) => {
        $ctrl.depots = depots;
      })
      .catch(Notify.handleError)
      .finally(() => {
        $ctrl.loading = false;
      });
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = $item => {
    $ctrl.onSelectCallback({ depot : $item });
  };
}
