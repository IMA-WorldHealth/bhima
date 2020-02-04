angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('data_collector_management', {
        url         : '/data_collector_management',
        controller  : 'DataCollectorManagementController as DataCollectorManagementCtrl',
        templateUrl : 'modules/data_collector_management/data_collector_management.html',
      })

      .state('data_collector_management.create', {
        url : '/create',
        params : {
          data_collector_management : { value : null },
          creating : { value : true },
        },
        onEnter : ['$uibModal', dataCollectorManagementModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('data_collector_management.edit', {
        url : '/:id/edit',
        params : {
          data_collector_management : { value : null },
          creating : { value : false },
        },
        onEnter : ['$uibModal', dataCollectorManagementModal],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function dataCollectorManagementModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/data_collector_management/modals/data_collector_management.modals.html',
    controller : 'DataCollectorManagementModalController as DataCollectorManagementModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
