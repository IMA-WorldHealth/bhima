angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('fill_form', {
        url         : '/fill_form',
        controller  : 'FillFormController as FillFormCtrl',
        templateUrl : 'modules/fill_form/fill_form.html',
      })

      .state('fill_form.fill', {
        url : '/:id/fill',
        params : {
          fill_form : { value : null },
          creating : { value : true },
        },
        onEnter : ['$uibModal', fillFormModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('fill_form.edit', {
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
