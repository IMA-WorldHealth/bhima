angular.module('bhima.directives')
  .directive('bhChangeDepot', bhChangeDepotController);

bhChangeDepotController.$inject = [
  'DepotService', 'appcache', 'NotifyService',
];

function bhChangeDepotController(Depots, AppCache, Notify) {
  return {
    restrict : 'E',
    replace : true,
    scope : {
      onSelect : '&',
    },
    template : `
    <a href ng-click="changeDepot()" data-action="change-depot">
      <i class="fa fa-archive"></i> <span translate>DEPOT.CHANGE</span>
    </a>
    `,
    link : (scope) => {
      const $ctrl = scope;
      const cache = new AppCache('StockCache');

      init();

      $ctrl.changeDepot = changeDepot;

      function init() {
        return cache.depotUuid
          ? loadDepot(cache.depotUuid)
          : changeDepot();
      }

      function loadDepot(uuid) {
        Depots.read(uuid, { only_user : true })
          .then(depot => {
            $ctrl.currentDepot = depot;
            $ctrl.onSelect({ depot });
          })
          .catch(handleError);
      }

      function changeDepot() {
        // if requirement is true the modal cannot be canceled
        const requirement = !cache.depotUuid;

        return Depots.openSelectionModal($ctrl.currentDepot, requirement)
          .then(depot => {
            cache.depotUuid = depot.uuid;
            $ctrl.currentDepot = depot;
            $ctrl.onSelect({ depot });
          });
      }

      function handleError(err) {
        return err.status === 404
          ? changeDepot()
          : Notify.handleError(err);
      }
    },
  };
}
