angular.module('bhima.components')
  .component('bhChangeDepot', {
    templateUrl : 'js/components/bhChangeDepot/bhChangeDepot.html',
    controller  : ChangeDepotController,
    transclude  : true,
    bindings    : {
      currentDepot : '<',
      onSelect : '&',
    },
  });

ChangeDepotController.$inject = ['DepotService', 'appcache'];

function ChangeDepotController(Depots, AppCache) {
  const $ctrl = this;
  const cache = new AppCache('StockCache');

  $ctrl.$onInit = () => {
    if (cache.depotUuid) { return; }
    changeDepot();
  };

  $ctrl.changeDepot = changeDepot;

  function changeDepot() {
    // if requirement is true the modal cannot be canceled
    const requirement = !cache.depotUuid;

    return Depots.openSelectionModal($ctrl.currentDepot, requirement)
      .then(depot => {
        cache.depotUuid = depot.uuid;
        $ctrl.onSelect({ depot });
      });
  }
}
