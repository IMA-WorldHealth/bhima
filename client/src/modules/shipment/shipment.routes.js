angular.module('bhima.routes')
  .config(['$stateProvider', ($stateProvider) => {
    $stateProvider
      .state('shipments', {
        url : '/shipments',
        templateUrl : 'modules/shipment/shipment.html',
        controller : 'ShipmentRegistryController as ShipmentCtrl',
      })

      .state('shipments.create', {
        url : '/create',
        params : {
          parentUuid : { squash : true, value : null },
          isCreateState : { value : true },
        },
        onEnter : ['$uibModal', '$transition$', shipmentModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('shipments.edit', {
        url : '/:uuid/edit',
        params : {
          uuid : { value : null, squash : true },
          isCreateState : { value : false },
        },
        onEnter : ['$uibModal', '$transition$', shipmentModal],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function shipmentModal($modal, $transition) {
  $modal.open({
    templateUrl : 'modules/shipment/modals/shipment.modal.html',
    controller : 'ShipmentModalController as ShipmentModalCtrl',
    resolve : { params : () => $transition.params('to') },
  }).result.catch(angular.noop);
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
