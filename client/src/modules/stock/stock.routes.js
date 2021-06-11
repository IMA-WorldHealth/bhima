angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('stockLots', {
        url         : '/stock/lots',
        controller  : 'StockLotsController as StockLotsCtrl',
        templateUrl : 'modules/stock/lots/registry.html',
        params : {
          filters : [],
        },
      })

      .state('stockLotsDuplicates', {
        url         : '/stock/lots/duplicates',
        controller  : 'DuplicateLotsController as DupeLotsCtrl',
        templateUrl : 'modules/stock/lots-duplicates/lots-duplicates.html',
        params : {
          filters : [],
        },
      })

      .state('stockMovements', {
        url         : '/stock/movements',
        controller  : 'StockMovementsController as StockCtrl',
        templateUrl : 'modules/stock/movements/registry.html',
        params : {
          filters : [],
        },
      })

      .state('stockInventories', {
        url         : '/stock/inventories',
        controller  : 'StockInventoriesController as StockCtrl',
        templateUrl : 'modules/stock/inventories/registry.html',
        params : {
          filters : [],
        },
      })

      .state('stockExit', {
        url         : '/stock/exit',
        controller  : 'StockExitController as StockCtrl',
        templateUrl : 'modules/stock/exit/exit.html',
        onExit  : ['$uibModalStack', closeModals],
      })

      .state('stockEntry', {
        url         : '/stock/entry',
        controller  : 'StockEntryController as StockCtrl',
        templateUrl : 'modules/stock/entry/entry.html',
        onExit  : ['$uibModalStack', closeModals],
      })

      .state('stockAdjustment', {
        url         : '/stock/adjustment',
        controller  : 'StockAdjustmentController as StockCtrl',
        templateUrl : 'modules/stock/adjustment/adjustment.html',
        onExit  : ['$uibModalStack', closeModals],
      })

      .state('stockInventoryAdjustment', {
        url         : '/stock/inventory-adjustment',
        controller  : 'StockInventoryAdjustmentController as StockCtrl',
        templateUrl : 'modules/stock/inventory-adjustment/inventory-adjustment.html',
      })

      .state('stockImport', {
        url         : '/stock/import',
        controller  : 'StockImportController as StockCtrl',
        templateUrl : 'modules/stock/import/stockImport.html',
      })

      .state('stockAssign', {
        url         : '/stock/assign',
        controller  : 'StockLotsAssignController as StockCtrl',
        templateUrl : 'modules/stock/assign/registry.html',
        params : {
          filters : [],
        },
      })
      .state('stockAssign.create', {
        url : '/create',
        params : {
          creating : { value : true },
          filters : [],
        },
        onEnter : ['$state', 'StockModalService', '$transition$', onEnterFactory('create', 'stockAssign')],
        onExit : ['$uibModalStack', closeModals],
      })

      .state('stockRequisition', {
        url         : '/stock/requisition',
        controller  : 'StockRequisitionController as StockCtrl',
        templateUrl : 'modules/stock/requisition/registry.html',
        params : {
          filters : [],
        },
      })
      .state('stockRequisition.create', {
        url : '/create',
        onEnter : ['$state', 'StockModalService', '$transition$', onEnterFactory('create', 'stockRequisition')],
        params : { depot : null },
        onExit : ['$uibModalStack', closeModals],
      })
      .state('stockRequisition.edit', {
        url : '/:uuid/edit',
        params : {
          uuid : { value : null },
        },
        onEnter : ['$state', 'StockModalService', '$transition$', onEnterFactory('edit', 'stockRequisition')],
        onExit : ['$uibModalStack', closeModals],
      })

      .state('stockSetting', {
        url         : '/stock/setting',
        controller  : 'StockSettingsController as StockSettingsCtrl',
        templateUrl : 'modules/stock/settings/stock-settings.html',
        params : { },
      })

      .state('stockAggregatedConsumption', {
        url         : '/stock/aggregated_consumption',
        controller  : 'StockAggregatedConsumptionController as StockCtrl',
        templateUrl : 'modules/stock/aggregated_consumption/aggregated_consumption.html',
        params : {
          filters : [],
        },
      });
  }]);

function closeModals($uibModalStack) {
  $uibModalStack.dismissAll();
}

// creates both the create and update states
function onEnterFactory(stateType, state) {
  const isCreateState = stateType === 'create';

  return function onEnter($state, StockModal, $transition) {
    const transitionParams = $transition.params('to');
    const mapAction = {
      stockAssign : StockModal.openActionStockAssign,
      stockRequisition : StockModal.openActionStockRequisition,
    };

    const instance = mapAction[state];
    instance(transitionParams)
      .then((_uuid) => {
        const params = { uuid : _uuid };

        if (isCreateState) {
          params.created = true;
        } else {
          params.updated = true;
        }

        $state.go(state, params, { reload : true });
      })
      .catch(() => {
        $state.go(state, { uuid : $state.params.id }, { notify : false });
      });
  };
}
