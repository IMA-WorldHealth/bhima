angular.module('bhima.components')
  .component('bhServiceOrDepot', {
    templateUrl : 'js/components/bhServiceOrDepot/bhServiceOrDepot.html',
    controller  : bhServiceOrDepotController,
    transclude  : true,
    bindings    : {
      uuid             : '<',
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

    Promise.all([
      Stock.stockRequestorType.read(),
      Depots.read(),
      Services.read(),
    ])
      .then(initCollections)
      .catch(Notify.handleError);
  };

  function initCollections([requestors, depots, services]) {
    Object.assign($ctrl, { requestors, depots, services });

    $ctrl.serviceIds = $ctrl.services.map(service => service.uuid);
    $ctrl.depotIds = $ctrl.depots.map(depot => depot.uuid);

    if ($ctrl.uuid) {
      $ctrl.requestorType = getRequestorType($ctrl.uuid);
    }
  }

  function getRequestorType(identifier) {
    const SERVICE_REQUESTOR_TYPE = 1;
    const DEPOT_REQUESTOR_TYPE = 2;
    const foundInService = $ctrl.serviceIds.includes(identifier);
    const foundInDepot = $ctrl.depotIds.includes(identifier);

    if (foundInService) {
      return $ctrl.requestors.filter(row => row.id === SERVICE_REQUESTOR_TYPE)[0];
    }

    if (foundInDepot) {
      return $ctrl.requestors.filter(row => row.id === DEPOT_REQUESTOR_TYPE)[0];
    }

    return null;
  }

  $ctrl.onChangeRequestor = () => {
    $ctrl.onSelectCallback({ requestor : {} });
  };

  $ctrl.onSelectRequestor = requestor => {
    $ctrl.requestorUuid = requestor.uuid;
    requestor.requestor_type_id = $ctrl.requestorType.id;
    $ctrl.onSelectCallback({ requestor });
  };
}
