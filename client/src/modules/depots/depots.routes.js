angular.module('bhima.routes')
.config(['$stateProvider', function ($stateProvider) {
  $stateProvider
    .state('depots', {
      url         : '/depots',
      controller  : 'DepotManagementController as DepotCtrl',
      templateUrl : 'modules/depots/depots.html',
    })

    .state('depots.create', {
      url : '/create',
      params : {
        depot : { value : null },
        creating : { value : true },
      },
      onEnter : ['$uibModal', depotModal],
      onExit : ['$uibModalStack', closeModal],
    })

    .state('depots.edit', {
      url : '/edit',
      params : {
        depot : { value : null },
        creating : { value : false },
      },
      onEnter : ['$uibModal', depotModal],
      onExit : ['$uibModalStack', closeModal],
    });
}]);

function depotModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/depots/modals/depot.modal.html',
    controller : 'DepotModalController as DepotModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
