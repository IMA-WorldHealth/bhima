angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('cdrReportingDepots', {
        url         : '/cdr_reporting/depots',
        controller  : 'CDRReportingDepotController as CdrDepotCtrl',
        templateUrl : 'modules/cdr_reporting/depots/depots.html',
      })

      .state('cdrReportingDepots.create', {
        url : '/create',
        params : {
          isCreateState : { value : true },
        },
        onEnter : ['$uibModal', '$transition$', cdrDepotModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('cdrReportingDepots.edit', {
        url : '/:uuid/edit',
        params : {
          uuid : { value : null, squash : true },
          isCreateState : { value : false },
        },
        onEnter : ['$uibModal', '$transition$', cdrDepotModal],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function cdrDepotModal($modal, $transition) {
  $modal.open({
    templateUrl : 'modules/cdr_reporting/depots/modals/depot.modal.html',
    controller : 'CdrDepotModalController as CdrDepotModalCtrl',
    resolve : { params : () => $transition.params('to') },
  }).result.catch(angular.noop);
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
