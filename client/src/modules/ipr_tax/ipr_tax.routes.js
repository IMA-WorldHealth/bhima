angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('ipr_tax', {
        url         : '/ipr_tax',
        controller  : 'IprTaxManagementController as IprTaxCtrl',
        templateUrl : 'modules/ipr_tax/ipr_tax.html',
      })

      .state('iprConfiguration', {
        url         : '/ipr_tax/configuration',
        controller  : 'IprTaxConfigurationController as IprTaxConfigCtrl',
        templateUrl : 'modules/ipr_tax/configuration/iprTaxConfig.html',
      })

      .state('ipr_tax.create', {
        url : '/create',
        params : {
          creating : { value : true },
        },
        onEnter : ['$uibModal', iprTaxModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('iprConfiguration.createConfig', {
        url : '/:taxIprId/configuration/create',
        params : {
          creating : { value : true },
        },
        onEnter : ['$uibModal', iprTaxConfigModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('ipr_tax.edit', {
        url : '/:id/edit',
        params : {
          creating : { value : false },
        },
        onEnter : ['$uibModal', iprTaxModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('iprConfiguration.editConfig', {
        url : '/:taxIprId/configuration/:id/edit',
        params : {
          creating : { value : false },
        },
        onEnter : ['$uibModal', iprTaxConfigModal],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function iprTaxModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/ipr_tax/modals/ipr_tax.modal.html',
    controller : 'IprTaxModalController as IprTaxModalCtrl',
  });
}

function iprTaxConfigModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/ipr_tax/modals/ipr_tax_config.modal.html',
    controller : 'IprTaxConfigModalController as IprTaxConfigModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
