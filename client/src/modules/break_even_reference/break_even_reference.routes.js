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
          break_even_reference : { value : null },
          creating : { value : true },
        },
        onEnter : ['$uibModal', breakEvenReferenceModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('break_even_reference.edit', {
        url : '/:id/edit',
        params : {
          break_even_reference : { value : null },
          creating : { value : false },
        },
        onEnter : ['$uibModal', breakEvenReferenceModal],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function breakEvenReferenceModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/break_even_reference/modals/break_even_reference.modal.html',
    controller : 'BreakEvenReferenceModalController as BreakEvenReferenceModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
