angular.module('bhima.controllers')
.controller('PurchaseController', PurchaseController);

PurchaseController.$inject = [
  '$scope', '$location', '$translate'
];

function PurchaseController($scope, $location, $translate) {
  var configuration = $scope.configuration = {};

  configuration.operations = [{
    key : $translate.instant('PURCHASE_MENU.PUCHASE_CREATION'),
    link : '/purchases/create'
  }, {
    key : $translate.instant('PURCHASE_MENU.VIEW'),
    link : '/purchases/view/'
  }];

  $scope.loadPath = function loadPath(path) {
    $location.path(path);
  };
}
