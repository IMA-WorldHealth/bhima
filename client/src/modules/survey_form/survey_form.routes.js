angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('survey_form', {
        url         : '/survey_form',
        controller  : 'SurveyFormController as SurveyFormCtrl',
        templateUrl : 'modules/survey_form/survey_form.html',
      })

      .state('survey_form.create', {
        url : '/create',
        params : {
          survey_form : { value : null },
          creating : { value : true },
          collectorId : { value : true },
        },
        onEnter : ['$uibModal', surveyFormModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('survey_form.edit', {
        url : '/:id/edit',
        params : {
          survey_form : { value : null },
          creating : { value : false },
          collectorId : { value : true },
        },
        onEnter : ['$uibModal', surveyFormModal],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function surveyFormModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/survey_form/modals/survey_form.modals.html',
    controller : 'SurveyFormModalController as SurveyFormModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
