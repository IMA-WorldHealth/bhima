angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {

    /**
     * Invoicing Fee Routes
     *
     * The invoicing fees route endpoints.
     *
     * @todo - discuss if the "delete" route should be included as a separate
     * view/state.  It doesn't really need to be deep-linked.
     */
    $stateProvider
      .state('invoicingFees', {
        url         : '/invoicing_fees',
        abstract    : true,
        templateUrl : 'modules/invoicing-fees/invoicing-fees.html',
        controller  : 'InvoicingFeesController as InvoicingFeesCtrl',
      })
      .state('invoicingFees.create', {
        url     : '/create',
        onEnter : ['$state', '$uibModal', 'NotifyService', onInvoicingFeeEnterFactory('create')],
        onExit  : ['$uibModalStack', closeModal],
      })
      .state('invoicingFees.list', {
        url    : '/{id:int}',
        params : {
          id      : { squash : true, value : null },
          created : false,  // default for transitioning from child states
          updated : false,  // default for transitioning from child states
        },
      })
      .state('invoicingFees.update', {
        url     : '/{id:int}/update',
        onEnter : ['$state', '$uibModal', 'NotifyService', onInvoicingFeeEnterFactory('update')],
        onExit  : ['$uibModalStack', closeModal]
      })
      .state('invoicingFees.delete', {
        url     : '/{id:int}/delete',
        onEnter : ['$state', '$uibModal', 'NotifyService', function ($state, Modal, Notify) {
          Modal.open({
            keyboard    : true,
            size        : 'md',
            controller  : 'InvoicingFeesDeleteController as ConfirmModalCtrl',
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
function onInvoicingFeeEnterFactory(stateType) {
  var isCreateState = (stateType === 'create');

  var ctrl = isCreateState ?
    'InvoicingFeesCreateController as InvoicingFeesFormCtrl' :
    'InvoicingFeesUpdateController as InvoicingFeesFormCtrl';

  var message = isCreateState ?
    'FORM.INFO.CREATE_SUCCESS' :
    'FORM.INFO.UPDATE_SUCCESS';


  return function onEnter($state, Modal, Notify) {
      Modal.open({
        templateUrl : 'modules/invoicing-fees/invoicing-fees-modal.html',
        controller  : ctrl,
        backdrop    : 'static',
        keyboard    : false,
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

