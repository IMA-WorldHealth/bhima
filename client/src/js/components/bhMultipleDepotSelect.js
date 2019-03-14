angular.module('bhima.components')
  .component('bhMultipleDepotSelect', {
    templateUrl : 'modules/templates/bhMultipleDepotSelect.tmpl.html',
    controller  : MultipleDepotSelectController,
    bindings    : {
      depotsUuids     : '<',
      label           : '@?',
      onChange        : '&',
      formName        : '@?',
    },
  });

MultipleDepotSelectController.$inject = [
  'DepotService', 'NotifyService',
];

/**
 * Multiple Depot Selection Component
 *
 */
function MultipleDepotSelectController(Depots, Notify) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    // label to display
    $ctrl.label = $ctrl.label || 'STOCK.DEPOT';

    // default for form name
    $ctrl.formName = $ctrl.formName || 'DepotForm';

    // init the model
    $ctrl.depotsUuids = $ctrl.depotsUuids || [];

    // load all Depot
    Depots.read()
      .then(depots => {
        $ctrl.depots = depots;
      })
      .catch(Notify.handleError);
  };


  // fires the onChange bound to the component boundary
  $ctrl.handleChange = (depots) => {
    $ctrl.onChange({ depots });
  };
}
