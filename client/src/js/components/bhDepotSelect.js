angular.module('bhima.components')
  .component('bhDepotSelect', {
    templateUrl : 'modules/templates/bhDepotSelect.tmpl.html',
    controller  : DepotSelectController,
    transclude  : true,
    bindings    : {
      depotId           : '<',
      disable          : '<?',
      onSelectCallback : '&',
      name             : '@?',
      required         : '<?',      
    },
  });

DepotSelectController.$inject = [
  'DepotService'
];

/**
 * Depot selection component
 */
function DepotSelectController(Depots) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {    
    // fired when an user has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // default for form name
    $ctrl.name = $ctrl.name || 'DepotForm';

    // load all Depots
    Depots.read()
      .then(function (depots) {        
        $ctrl.depots = depots;
      });

    $ctrl.valid = true;
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item, $model) {
    $ctrl.onSelectCallback({ depot : $item });
  };
}
