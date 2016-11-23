angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('inventory', {
        url : '/inventory',
        controller : 'InventoryListController as InventoryCtrl',
        templateUrl : 'partials/inventory/list/list.html'
      })
      .state('inventory.create', {
        url : '/create',
        onEnter :['$state', 'ModalService', openInventoryCreateModal],
        onExit : ['$uibModalStack', closeModal]
      })
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

function openInventoryCreateModal($state, Modal) {
  var request = { action : 'add' };
  var instance = Modal.openInventoryListActions(request);

  instance

    // TODO - make this pass the uuid for flashing
    .then(function (uuid) {

      // inventory list should take a uuid in for flashing
      $state.go('^', null , { notify : true });
    })
    .catch(function () {
      $state.go('^');
    });
}
