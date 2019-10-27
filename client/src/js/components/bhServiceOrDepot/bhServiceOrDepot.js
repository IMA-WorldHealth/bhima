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
  'ServiceService', 'DepotService', 'NotifyService',
];

/**
 * service or depot selection component
 */
function bhServiceOrDepotController(Services, Depots, Notify) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    $ctrl.label = $ctrl.label || 'REQUISITION.SERVICE_OR_DEPOT';
    $ctrl.requestors = [
      { key : 'service', title : 'FORM.LABELS.SERVICE' },
      { key : 'depot', title : 'FORM.LABELS.DEPOT' },
    ];

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

  $ctrl.onSelectRequestor = requestor => {
    $ctrl.onSelectCallback({ requestor });
  };
}
