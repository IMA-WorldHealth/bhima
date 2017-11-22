angular.module('bhima.routes')
.config(['$stateProvider', function ($stateProvider) {
  $stateProvider
    .state('grades', {
      url         : '/grades',
      controller  : 'GradeManagementController as GradeCtrl',
      templateUrl : 'modules/grades/grades.html',
    })

    .state('grades.create', {
      url : '/create',
      params : {
        grade : { value : null },
        creating : { value : true },
      },
      onEnter : ['$uibModal', gradeModal],
      onExit : ['$uibModalStack', closeModal],
    })

    .state('grades.edit', {
      url : '/:uuid/edit',
      params : {
        grade : { value : null },
        creating : { value : false },
      },
      onEnter : ['$uibModal', gradeModal],
      onExit : ['$uibModalStack', closeModal],
    });
}]);

function gradeModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/grades/modals/grade.modal.html',
    controller : 'GradeModalController as GradeModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
