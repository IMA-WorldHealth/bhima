angular.module('bhima.routes')
  .config(['$stateProvider', ($stateProvider) => {
    $stateProvider
      .state('shipments', {
        url : '/shipments',
        templateUrl : 'modules/shipment/shipment.html',
        controller : 'ShipmentRegistryController as ShipmentCtrl',
      })

      .state('shipments.overview', {
        url : '/overview',
        params : {
          uuid : null,
        },
        onEnter : ['$uibModal', '$transition$', shipmentOverviewModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('shipments.update-tracking-log', {
        url : '/update-tracking-log',
        params : {
          uuid : null,
        },
        onEnter : ['$uibModal', '$transition$', updateTrackingLogModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('shipments.ready-for-shipment', {
        url : '/ready-for-shipment',
        params : {
          uuid : null,
        },
        onEnter : ['$uibModal', '$transition$', setReadyForShipmentModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('shipments-create', {
        url : '/shipments/create',
        params : {
          isCreateState : { value : true },
        },
        templateUrl : 'modules/shipment/create-shipment.html',
        controller : 'CreateShipmentController as CreateShipCtrl',
        onEnter : ['$transition$', gotoPage],
      })

      .state('shipments-edit', {
        url : '/shipments/:uuid/edit',
        params : {
          uuid : { value : null, squash : true },
          isCreateState : { value : false },
        },
        templateUrl : 'modules/shipment/create-shipment.html',
        controller : 'CreateShipmentController as CreateShipCtrl',
        onEnter : ['$transition$', gotoPage],
      });
  }]);

function gotoPage($transition) {
  $transition.params('to');
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}

function shipmentOverviewModal($modal, $transition) {
  $modal.open({
    size : 'lg',
    templateUrl : 'modules/shipment/modals/overview.modal.html',
    controller : 'ShipmentOverviewModalController as $ctrl',
    resolve : { params : () => $transition.params('to') },
  }).result.catch(angular.noop);
}

function setReadyForShipmentModal($modal, $transition) {
  $modal.open({
    templateUrl : 'modules/shipment/modals/ready-for-shipment.modal.html',
    controller : 'ReadyForShipmentModalController as $ctrl',
    resolve : { params : () => $transition.params('to') },
  }).result.catch(angular.noop);
}

function updateTrackingLogModal($modal, $transition) {
  $modal.open({
    size : 'lg',
    templateUrl : 'modules/shipment/modals/tracking-log.modal.html',
    controller : 'UpdateTrackingLogModalController as $ctrl',
    resolve : { params : () => $transition.params('to') },
  }).result.catch(angular.noop);
}
