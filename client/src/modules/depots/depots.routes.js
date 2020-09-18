angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('depots', {
        url         : '/depots',
        controller  : 'DepotManagementController as DepotCtrl',
        templateUrl : 'modules/depots/depots.html',
      })

      .state('depots.create', {
        url : '/create',
        params : {
          isCreateState : { value : true },
        },
        onEnter : ['$uibModal', '$transition$', depotModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('depots.edit', {
        url : '/edit',
        params : {
          depot : { value : {} },
          isCreateState : { value : false },
        },
        onEnter : ['$uibModal', '$transition$', depotModal],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function depotModal($modal, $transition) {
  $modal.open({
    templateUrl : 'modules/depots/modals/depot.modal.html',
    controller : 'DepotModalController as DepotModalCtrl',
    resolve : { params : () => $transition.params('to') },
  }).result.catch(angular.noop);
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
