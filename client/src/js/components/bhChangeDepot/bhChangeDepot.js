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

ChangeDepotController.$inject = ['DepotService', 'appcache', 'NotifyService'];

function ChangeDepotController(Depots, AppCache, Notify) {
  const $ctrl = this;
  const cache = new AppCache('StockCache');

  $ctrl.$onInit = () => {
    return cache.depotUuid
      ? loadDepot(cache.depotUuid)
      : changeDepot();
  };

  $ctrl.changeDepot = changeDepot;

  function loadDepot(uuid) {
    Depots.read(uuid, { only_user : true })
      .then(depot => {
        $ctrl.onSelect({ depot });
      })
      .catch(Notify.handleError);
  }

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
