angular.module('bhima.routes')
.config(['$stateProvider', function ($stateProvider) {
  $stateProvider

    .state('services', {
      url         : '/services',
      controller  : 'ServicesController as ServicesCtrl',
      templateUrl : 'modules/services/services.html',
    })

    .state('services.create', {
      url : '/create',
      params : {
        service : { value : null },
        creating : { value : true },
      },
      onEnter : ['$uibModal', serviceModal],
      onExit : ['$uibModalStack', closeModal],
    })

    .state('services.edit', {
      url : '/edit',
      params : {
        service : { value : null },
        creating : { value : false },
      },
      onEnter : ['$uibModal', serviceModal],
      onExit : ['$uibModalStack', closeModal],
    });
}]);

function serviceModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/services/modals/service.modal.html',
    controller : 'ServiceModalController as ServiceModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
