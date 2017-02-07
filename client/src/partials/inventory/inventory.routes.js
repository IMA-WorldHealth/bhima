angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('inventoryConfiguration', {
        url : '/inventory/configuration',
        views : {
          '' : {
            templateUrl : 'partials/inventory/configuration/configuration.html',
            controller : 'InventoryConfigurationController as InventoryCtrl'
          },
          'groups@inventoryConfiguration' : {
            templateUrl : 'partials/inventory/configuration/groups/groups.html',
            controller : 'InventoryGroupsController as GroupsCtrl'
          },
          'types@inventoryConfiguration' : {
            templateUrl : 'partials/inventory/configuration/types/types.html',
            controller : 'InventoryTypesController as TypesCtrl'
          },
          'units@inventoryConfiguration' : {
            templateUrl : 'partials/inventory/configuration/units/units.html',
            controller : 'InventoryUnitsController as UnitsCtrl'
          }
        }
     })
      .state('inventory', {
        abstract : true,
        url : '/inventory',
        controller : 'InventoryListController as InventoryCtrl',
        templateUrl : 'partials/inventory/list/list.html'
      })
      .state('inventory.create', {
        url : '/create',
        onEnter :['$state', 'ModalService', onEnterFactory('create')],
        onExit : ['$uibModalStack', closeModal]
      })
      .state('inventory.update', {
        url : '/:uuid/update',
        onEnter :['$state', 'ModalService', onEnterFactory('update')],
        onExit : ['$uibModalStack', closeModal]
      })
      .state('inventory.list', {
        url: '/:uuid',
        params : {
          uuid : { squash : true, value : null },
          created : false,  // default for transitioning from child states
          updated : false,  // default for transitioning from child states
        }
      });
      // @TODO IMPLEMENT THEM
      // .state('/inventory/types',  {
      //   url : '/inventory/types',
      //   controller : 'InventoryTypesController as InventoryCtrl',
      //   templateUrl : 'partials/inventory/types/types.html'
      // })
  }]);


function closeModal($uibModalStack) {
  $uibModalStack.dismissAll();
}

// creates both the create and update states
function onEnterFactory(stateType) {
  var isCreateState = (stateType === 'create');

  return function onEnter ($state, Modal) {
    var instance = Modal.openInventoryListActions();
    instance
      .then(function (uuid) {

        var params = { uuid : uuid };

        if (isCreateState) {
          params.created = true;
        } else {
          params.updated = true;
        }

        $state.go('^.list', params, { reload : true });
      })
      .catch(function (error) {
        $state.go('^.list', { uuid : $state.params.id }, {notify : false });
      });
  };
}
