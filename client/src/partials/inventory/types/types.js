angular.module('bhima.controllers')
.controller('InventoryTypeController', InventoryTypeController);

InventoryTypeController.$inject = [
  '$scope', 'validate', 'connect'
];

function InventoryTypeController($scope, validate, connect) {
  var dependencies = {};

  dependencies.types = {
    query : {
      tables : {
        'inventory_type' : {
          columns : ['id', 'text']
        }
      }
    }
  };

  function startup(models) {
    angular.extend($scope, models);
  }

  validate.process(dependencies)
  .then(startup);

  $scope.edit = function edit(type) {
    $scope.action = 'edit';
    $scope.e = type;
    $scope.eCopy = angular.copy(type);
  };

  $scope.resetEdit = function resetEdit() {
    $scope.e = angular.copy($scope.eCopy);
  };

  $scope.submitEdit = function submitEdit() {
    connect.put('inventory_type', [connect.clean($scope.e)], ['id'])
    .then(function () {
      $scope.action = '';
    });
  };

  $scope.new = function newItem() {
    $scope.action = 'new';
    $scope.n = {};
  };

  $scope.resetNew = function resetNew() {
    $scope.n = {};
  };

  $scope.submitNew = function submitNew() {
    connect.post('inventory_type', [connect.clean($scope.n)])
    .then(function (res) {
      $scope.types.post({id : res.data.insertId, text : $scope.n.text });
      $scope.action = '';
    });
  };
}
