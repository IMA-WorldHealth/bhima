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
        onEnter : ['$state', 'StockModalService', onEnterFactory('create')],
        onExit : ['$uibModalStack', closeModals],
      });
  }]);


function closeModals($uibModalStack) {
  $uibModalStack.dismissAll();
}

// creates both the create and update states
function onEnterFactory(stateType) {
  const isCreateState = stateType === 'create';

  return function onEnter($state, StockModal) {
    const instance = StockModal.openActionStockAssign();
    instance
      .then((_uuid) => {
        const params = { uuid : _uuid };

        if (isCreateState) {
          params.created = true;
        } else {
          params.updated = true;
        }

        $state.go('stockAssign', params, { reload : true });
      })
      .catch(() => {
        $state.go('stockAssign', { uuid : $state.params.id }, { notify : false });
      });
  };
}
