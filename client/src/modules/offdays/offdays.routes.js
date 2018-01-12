angular.module('bhima.routes')
.config(['$stateProvider', function ($stateProvider) {
  $stateProvider
    .state('offdays', {
      url         : '/offdays',
      controller  : 'OffdayManagementController as OffdayCtrl',
      templateUrl : 'modules/offdays/offdays.html',
    })

    .state('offdays.create', {
      url : '/create',
      params : {
        offday : { value : null },
        creating : { value : true },
      },
      onEnter : ['$uibModal', offdayModal],
      onExit : ['$uibModalStack', closeModal],
    })

    .state('offdays.edit', {
      url : '/:id/edit',
      params : {
        offday : { value : null },
        creating : { value : false },
      },
      onEnter : ['$uibModal', offdayModal],
      onExit : ['$uibModalStack', closeModal],
    });
}]);

function offdayModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/offdays/modals/offday.modal.html',
    controller : 'OffdayModalController as OffdayModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}