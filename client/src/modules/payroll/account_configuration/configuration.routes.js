angular.module('bhima.routes')
.config(['$stateProvider', function ($stateProvider) {
  $stateProvider
    .state('configurationAccount', {
      url         : '/payroll/account_configuration',
      controller  : 'ConfigurationAccountController as ConfigurationCtrl',
      templateUrl : 'modules/payroll/account_configuration/configuration.html',
    })

    .state('configurationAccount.create', {
      url : '/create',
      params : {
        account : { value : null },
        creating : { value : true },
      },
      onEnter : ['$uibModal', configurationAccountModal],
      onExit : ['$uibModalStack', closeModal],
    })

    .state('configurationAccount.edit', {
      url : '/:id/edit',
      params : {
        account : { value : null },
        creating : { value : false },
      },
      onEnter : ['$uibModal', configurationAccountModal],
      onExit : ['$uibModalStack', closeModal],
    })

    .state('configurationAccount.config', {
      url : '/:id/config',
      params : {
        account : { value : null },
      },
      onEnter : ['$uibModal', configurationAccount],
      onExit : ['$uibModalStack', closeModal],
    });    
}]);

function configurationAccountModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/payroll/account_configuration/modals/account.modal.html',
    controller : 'AccountConfigModalController as AccountConfigModalCtrl',
  });
}

function configurationAccount($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/payroll/account_configuration/modals/config.modal.html',
    controller : 'AccountConfigModalController as AccountConfigModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}

