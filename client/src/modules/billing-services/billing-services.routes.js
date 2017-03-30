angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {

    /**
     * Billing Services Routes
     *
     * The billing services route endpoints.
     *
     * @todo - discuss if the "delete" route should be included as a separate
     * view/state.  It doesn't really need to be deep-linked.
     */
    $stateProvider
      .state('billingServices', {
        url         : '/billing_services',
        abstract    : true,
        templateUrl : 'modules/billing-services/billing-services.html',
        controller  : 'BillingServicesController as BillingServicesCtrl',
      })
      .state('billingServices.create', {
        url     : '/create',
        onEnter : ['$state', '$uibModal', 'NotifyService', onBillingEnterFactory('create')],
        onExit  : ['$uibModalStack', closeModal],
      })
      .state('billingServices.list', {
        url    : '/{id:int}',
        params : {
          id      : { squash : true, value : null },
          created : false,  // default for transitioning from child states
          updated : false,  // default for transitioning from child states
        },
      })
      .state('billingServices.update', {
        url     : '/{id:int}/update',
        onEnter : ['$state', '$uibModal', 'NotifyService', onBillingEnterFactory('update')],
        onExit  : ['$uibModalStack', closeModal]
      })
      .state('billingServices.delete', {
        url     : '/{id:int}/delete',
        onEnter : ['$state', '$uibModal', 'NotifyService', function ($state, Modal, Notify) {
          Modal.open({
            keyboard    : true,
            size        : 'md',
            controller  : 'BillingServicesDeleteController as ConfirmModalCtrl',
            templateUrl : '/modules/templates/modals/confirm.modal.html',
          }).result
            .then(function () {
              Notify.success('FORM.INFO.DELETE_SUCCES');

              // go to the parent state (with refresh)
              $state.go('^.list', { id: null }, { reload: true });
            })
            .catch(function (error) {
              if (error) {
                Notify.handleError(error);
              }

              $state.go('^.list', { id : $state.params.id }, { notify: false });
            });
        }],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

/**
 * @function onEnterFactory
 *
 * @description
 * This configures the update versus create states.
 */
function onBillingEnterFactory(stateType) {
  var isCreateState = (stateType === 'create');

  var ctrl = isCreateState ?
    'BillingServicesCreateController as BillingServicesFormCtrl' :
    'BillingServicesUpdateController as BillingServicesFormCtrl';

  var message = isCreateState ?
    'FORM.INFO.CREATE_SUCCESS' :
    'FORM.INFO.UPDATE_SUCCESS';


  return function onEnter($state, Modal, Notify) {
      Modal.open({
        templateUrl : 'modules/billing-services/billing-services-modal.html',
        controller  : ctrl,
      }).result
        .then(function (id) {
          Notify.success(message);

          var params = isCreateState ?
            { id: id, created: true } :
            { id: id, updated: true };

          // go to the parent state (with refresh)
          $state.go('^.list', params, { reload: true });
        })
        .catch(function (error) {

          if (error) {
            Notify.handleError(error);
          }

          $state.go('^.list', { id: $state.params.id }, { notify: false });
        });
  };
}

function closeModal($uibModalStack) {
  $uibModalStack.dismissAll();
}

