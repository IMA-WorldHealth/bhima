angular.module('bhima.controllers')
.controller('exchangeRateModal', ['$scope', '$modalInstance', exchangeRateModal]);

function exchangeRateModal($scope, $modalInstance) {
  $scope.timestamp= new Date();
  $scope.close = $modalInstance.dismiss;
  $scope.setExchange = $modalInstance.close;
}
