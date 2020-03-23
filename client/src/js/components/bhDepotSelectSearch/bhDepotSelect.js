
angular.module('bhima.components')
  .component('bhDepotSearchSelect', {
    templateUrl : 'js/components/bhDepotSelectSearch/bhDepotSelectSearch.html',
    controller  : DepotSearchSelectController,
    bindings    : {
      depotsUuids     : '<',
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
    $ctrl.formName = $ctrl.formName || 'DepotForm';
    //
    $ctrl.depotsSected = $ctrl.depotsSected || [];
    // init the model
    $ctrl.depotsUuids = $ctrl.depotsUuids || [];

    $ctrl.componentId = $ctrl.id || uuidService().replace('-', '');
    $ctrl.depots = [];

    // on search text change
    setTimeout(() => {
      angular.element(document.getElementById($ctrl.componentId)).keyup(() => {
        loadDepots($ctrl.depotSelected);
      });
    }, 200);
  };

  $ctrl.$onChanges = () => {
    loadSelected($ctrl.depotsUuids);
  };

  // get depots by text
  function loadDepots(text) {
    Depots.read(null, {
      limit : 10,
      text,
    }).then(depots => {
      const selectedUuids = $ctrl.depotsSected.map(d => {
        return d.uuid;
      });
      $ctrl.depots = depots.filter(d => {
        return !selectedUuids.includes(d.uuid);
      });
    });
  }

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
  // eslint-disable-next-line no-shadow
  $ctrl.remove = (uuid) => {
    $ctrl.depotsSected = $ctrl.depotsSected.filter(depot => {
      return depot.uuid !== uuid;
    });
    $ctrl.handleChange();
  };


  function loadSelected(depotsUuids) {
    if (!(depotsUuids.length > 0)) return;
    Depots.depotsByUuids(depotsUuids).then(depots => {
      $ctrl.depotsSected = depots;
    });
  }
}
