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

    // requestor type
    Stock.stockRequestorType.read()
      .then(rows => {
        $ctrl.requestors = rows;
        return Depots.read(null);
      })
      .then(rows => {
        $ctrl.depots = rows;
        return Services.read(null);
      })
      .then(rows => {
        $ctrl.services = rows;
        if ($ctrl.uuid) {
          $ctrl.requestorType = getRequestorType($ctrl.uuid);
        }
      })
      .catch(Notify.handleError);
  };

  function getRequestorType(identifier) {
    const SERVICE_REQUESTOR_TYPE = 1;
    const DEPOT_REQUESTOR_TYPE = 2;
    const foundInService = $ctrl.services.filter(elt => elt.uuid === identifier)[0];
    const foundInDepot = $ctrl.depots.filter(elt => elt.uuid === identifier)[0];

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
