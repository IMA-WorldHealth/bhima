angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('break_even_reference', {
        url         : '/break_even_reference',
        controller  : 'BreakEvenReferenceController as BreakEvenReferenceCtrl',
        templateUrl : 'modules/break_even_reference/break_even_reference.html',
      })

      .state('break_even_reference.create', {
        url : '/create',
        params : {
          isCreateState : { value : true },
        },
        onEnter : ['$uibModal', '$transition$', breakEvenReferenceModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('break_even_reference.edit', {
        url : '/:id/edit',
        params : {
          id : { value : null },
          isCreateState : { value : false },
        },
        onEnter : ['$uibModal', '$transition$', breakEvenReferenceModal],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function breakEvenReferenceModal($modal, $transition) {
  $modal.open({
    templateUrl : 'modules/break_even_reference/modals/break_even_reference.modal.html',
    controller : 'BreakEvenReferenceModalController as BreakEvenReferenceModalCtrl',
    resolve : { params : () => $transition.params('to') },
  }).result.catch(angular.noop);
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
