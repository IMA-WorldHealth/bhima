angular.module('bhima.controllers')
.controller('fiscal.period', [
  '$scope',
  '$modalInstance',
  'params',
  function ($scope, $modalInstance, params) {
    $scope.enterprise = params.enterprise;
    $scope.accounts = params.accounts;
    $scope.fiscal = params.fiscal;

    params.accounts.forEach(function (row) {
      row.number = String(row.number);
    });

    $scope.dismiss = $modalInstance.close;
  }
]);
