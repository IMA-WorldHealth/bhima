angular.module('bhima.routes')
.config(['$stateProvider', function ($stateProvider) {
  $stateProvider
    .state('rubrics', {
      url         : '/payroll/rubrics',
      controller  : 'RubricManagementController as RubricCtrl',
      templateUrl : 'modules/payroll/rubrics/rubrics.html',
    })

    .state('rubrics.create', {
      url : '/create',
      params : {
        rubric : { value : null },
        creating : { value : true },
      },
      onEnter : ['$uibModal', rubricModal],
      onExit : ['$uibModalStack', closeModal],
    })

    .state('rubrics.edit', {
      url : '/:id/edit',
      params : {
        rubric : { value : null },
        creating : { value : false },
      },
      onEnter : ['$uibModal', rubricModal],
      onExit : ['$uibModalStack', closeModal],
    });
}]);

function rubricModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/payroll/rubrics/modals/rubric.modal.html',
    controller : 'RubricModalController as RubricModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}