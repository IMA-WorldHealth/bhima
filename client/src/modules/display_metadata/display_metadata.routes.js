angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('display_metadata', {
        url         : '/display_metadata',
        controller  : 'DisplayMetadataController as DisplayMetadataCtrl',
        templateUrl : 'modules/display_metadata/display_metadata.html',
      })

      .state('display_metadata.patient', {
        url         : '/:id/:patient/patient',
        controller  : 'DisplayMetadataController as DisplayMetadataCtrl',
        templateUrl : 'modules/display_metadata/display_metadata.html',
      })

      .state('display_metadata.patientfill', {
        url : '/:id/:patient/fill',
        params : {
          fill_form : { value : null },
          creating : { value : true },
        },
        onEnter : ['$uibModal', fillFormModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('display_metadata.patientEdit', {
        url : '/:id/:uuid/:patient/:include/edit',
        params : {
          fill_form : { value : null },
          creating : { value : true },
        },
        onEnter : ['$uibModal', fillFormModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('display_metadata.edit', {
        url : '/:id/:uuid/edit',
        params : {
          fill_form : { value : null },
          creating : { value : false },
        },
        onEnter : ['$uibModal', fillFormModal],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function fillFormModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/fill_form/modals/fill_form.modals.html',
    controller : 'FillFormModalController as FillFormModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
