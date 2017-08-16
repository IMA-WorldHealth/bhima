angular.module('bhima.components')
  .component('bhDepotSelect', {
    templateUrl : 'modules/templates/bhDepotSelect.tmpl.html',
    controller  : DepotSelectController,
    transclude  : true,
    bindings    : {
      depotUuid        : '<',
      label            : '<?',
      placeholder      : '<?',
      noServices       : '<?',
      onlyServices     : '<?',
      exceptUuid       : '<?',
      onSelectCallback : '&',
      required         : '<?',
      validateTrigger  : '<?',
    },
  });

DepotSelectController.$inject = [
  'DepotService', 'NotifyService',
];

/**
 * Depot selection component
 */
function DepotSelectController(Depots, Notify) {
  var $ctrl = this;
  var idx;

  $ctrl.$onInit = function onInit() {
    // fired when a depot has been selected
    $ctrl.label = $ctrl.label || 'STOCK.DEPOT';
    $ctrl.placeholder = $ctrl.placeholder || 'FORM.SELECT.DEPOT';
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // load all Depots
    Depots.read(null, {
      noServices : $ctrl.noServices,
      onlyServices : $ctrl.onlyServices,
    })
    .then(function (depots) {
      if ($ctrl.exceptUuid) {
        idx = depots.findIndex(function (item) {
          return item.uuid === $ctrl.exceptUuid;
        });

        if (idx > -1) { depots.splice(idx, 1); }
      }
      $ctrl.depots = depots;
    })
    .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item) {
    $ctrl.onSelectCallback({ depot : $item });
  };
}
