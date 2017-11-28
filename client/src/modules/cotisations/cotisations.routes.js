angular.module('bhima.routes')
.config(['$stateProvider', function ($stateProvider) {
  $stateProvider
    .state('cotisations', {
      url         : '/cotisations',
      controller  : 'CotisationManagementController as CotisationCtrl',
      templateUrl : 'modules/cotisations/cotisations.html',
    })

    .state('cotisations.create', {
      url : '/create',
      params : {
        cotisation : { value : null },
        creating : { value : true },
      },
      onEnter : ['$uibModal', cotisationModal],
      onExit : ['$uibModalStack', closeModal],
    })

    .state('cotisations.edit', {
      url : '/:id/edit',
      params : {
        cotisation : { value : null },
        creating : { value : false },
      },
      onEnter : ['$uibModal', cotisationModal],
      onExit : ['$uibModalStack', closeModal],
    });
}]);

function cotisationModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/cotisations/modals/cotisation.modal.html',
    controller : 'CotisationModalController as CotisationModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
