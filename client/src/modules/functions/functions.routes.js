angular.module('bhima.routes')
.config(['$stateProvider', function ($stateProvider) {
  $stateProvider
    .state('functions', {
      url         : '/functions',
      controller  : 'FunctionManagementController as FunctionCtrl',
      templateUrl : 'modules/functions/functions.html',
    })

    .state('functions.create', {
      url : '/create',
      params : {
        function : { value : null },
        creating : { value : true },
      },
      onEnter : ['$uibModal', functionModal],
      onExit : ['$uibModalStack', closeModal],
    })

    .state('functions.edit', {
      url : '/:id/edit',
      params : {
        function : { value : null },
        creating : { value : false },
      },
      onEnter : ['$uibModal', functionModal],
      onExit : ['$uibModalStack', closeModal],
    });
}]);

function functionModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/functions/modals/function.modal.html',
    controller : 'FunctionModalController as FunctionModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
