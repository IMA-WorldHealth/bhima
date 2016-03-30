angular.module('bhima.controllers')
.controller('inventory.groups', InventoryGroupController);

InventoryGroupController.$inject = [
  '$scope', 'validate', 'connect', 'uuid'
];

/**
* Inventory Group Controller
*
* This controller is responsible for assigning accounts to inventory groups and
* creating new inventory groups.
*
* TODO
*  1. Deleting an inventory group is not supported
*/
function InventoryGroupController($scope, validate, connect, uuid) {
  var dependencies = {};

  dependencies.groups = {
    query : {
      tables : {
        'inventory_group' : {
          columns : ['uuid', 'name', 'code', 'sales_account', 'cogs_account', 'stock_account', 'donation_account']
        }
      }
    }
  };

  dependencies.accounts = {
    query : {
      tables : {
        'account' : {
          columns : ['id', 'number', 'label']
        }
      }
    }
  };

  function startup(models) {

    // preformat account labels for massive speed gains
    models.accounts.data.forEach(function (accnt) {
      accnt.number =  String(accnt.number);
      accnt.label = [accnt.number, accnt.label].join(' -- ');
    });

    angular.extend($scope, models);
  }

  validate.process(dependencies)
  .then(startup);

  $scope.add = function add() {
    $scope.group = { uuid : uuid() };
    $scope.action = 'add';
  };

  $scope.edit = function edit(group) {
    $scope.group = group;
    $scope.action = 'edit';
    $scope.copy = angular.copy(group);
  };

  $scope.submitAdd = function submitAdd() {
    var data = connect.clean($scope.group);

    connect.post('inventory_group', [data])
    .then(function () {
      $scope.action = '';
      $scope.groups.post(data);
    });
  };

  $scope.submitEdit = function submitEdit() {
    var data = connect.clean($scope.group);

    if (!$scope.group.sales_account) {
      data.sales_account = null;
    }

    if (!$scope.group.cogs_account) {
      data.cogs_account = null;
    }

    if (!$scope.group.stock_account) {
      data.stock_account = null;
    }

    if (!$scope.group.donation_account) {
      data.donation_account = null;
    }

    connect.put('inventory_group', [data], ['uuid'])
    .then(function () {
      $scope.action = '';
      $scope.groups.put(data);
    });
  };

  $scope.discard = function discard() {
    $scope.group = { uuid : uuid() };
  };

  $scope.discardEdit = function discardEdit() {
    $scope.group = angular.copy($scope.copy);
  };

}
