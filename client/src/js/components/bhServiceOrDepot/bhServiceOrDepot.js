angular.module('bhima.components')
  .component('bhServiceOrDepot', {
    templateUrl : 'js/components/bhServiceOrDepot/bhServiceOrDepot.html',
    controller  : bhServiceOrDepotController,
    transclude  : true,
    bindings    : {
      uuid      : '<',
      onSelectCallback : '&',
      required         : '<?',
      label            : '@?',
    },
  });

bhServiceOrDepotController.$inject = [
  'ServiceService', 'DepotService', 'StockService', 'NotifyService',
];

/**
 * service or depot selection component
 */
function bhServiceOrDepotController(Services, Depots, Stock, Notify) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    $ctrl.label = $ctrl.label || 'REQUISITION.SERVICE_OR_DEPOT';

    // requestor type
    Stock.stockRequestorType.read()
      .then(rows => {
        $ctrl.requestors = rows;
      })
      .catch(Notify.handleError);

    // load all depots
    Depots.read(null)
      .then(rows => {
        $ctrl.depots = rows;
      })
      .catch(Notify.handleError);

    // load all services
    Services.read(null)
      .then(rows => {
        $ctrl.services = rows;
      })
      .catch(Notify.handleError);
  };

  $ctrl.onChangeRequestor = () => {
    $ctrl.onSelectCallback({ requestor : {} });
  };

  $ctrl.onSelectRequestor = requestor => {
    $ctrl.requestorUuid = requestor.uuid;
    requestor.requestor_type_id = $ctrl.requestorType.id;
    $ctrl.onSelectCallback({ requestor });
  };
}
