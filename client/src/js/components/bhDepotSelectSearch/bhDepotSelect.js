
angular.module('bhima.components')
  .component('bhDepotSearchSelect', {
    templateUrl : 'js/components/bhDepotSelectSearch/bhDepotSelectSearch.html',
    controller  : DepotSearchSelectController,
    bindings    : {
      depotsUuids     : '<?',
      required        : '<',
      label           : '@?',
      id              : '@?',
      onChange        : '&',
      formName        : '@?',
    },
  });

DepotSearchSelectController.$inject = [
  'DepotService', 'uuid',
];

/**
* Multiple Depot Selection Component
*
*/
function DepotSearchSelectController(Depots, uuidService) {
  const $ctrl = this;

  $ctrl.$onInit = () => {
  // label to display
    $ctrl.label = $ctrl.label || 'STOCK.DEPOT';
    // default for form name
    $ctrl.formName = $ctrl.formName || 'DepotSelectForm';
    //
    $ctrl.depotsSected = $ctrl.depotsSected || [];
    // init the model
    $ctrl.depotsUuids = $ctrl.depotsUuids || [];
    $ctrl.componentId = $ctrl.id || uuidService().replace('-', '');
  };

  $ctrl.$onChanges = () => {
    loadSelected($ctrl.depotsUuids);
  };

  // get depots by text
  $ctrl.loadDepots = (text) => {
    return Depots.read(null, {
      limit : 10,
      text,
    }).then(depots => {
      const selectedUuids = $ctrl.depotsSected.map(d => {
        return d.uuid;
      });
      return depots.filter(d => {
        return !selectedUuids.includes(d.uuid);
      });
    });
  };

  // on select a depot from the typehead
  $ctrl.onSelect = (item) => {
    $ctrl.depotsSected.push(angular.copy(item));
    $ctrl.handleChange();
    delete $ctrl.depotSelected;
  };

  // fires the onChange bound to the component boundary
  $ctrl.handleChange = () => {
    const depots = $ctrl.depotsSected.map(d => {
      return d.uuid;
    });
    $ctrl.onChange({ depots });
  };

  // remove a selected depot
  $ctrl.remove = (uuid) => {
    $ctrl.depotsSected = $ctrl.depotsSected.filter(depot => {
      return depot.uuid !== uuid;
    });
    $ctrl.handleChange();
  };


  function loadSelected(depotsUuids) {
    if (!(depotsUuids.length > 0)) return;
    Depots.read(null, { uuids : depotsUuids }).then(depots => {
      $ctrl.depotsSected = depots;
    });
  }
}
