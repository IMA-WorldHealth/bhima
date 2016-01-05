angular.module('bhima.controllers')
.controller('TaxesController', TaxesController);

TaxesController.$inject = [ '$scope', '$location', '$translate' ];

function TaxesController($scope, $location, $translate) {

  var configuration = $scope.configuration = {};

  configuration.operations = [ {
    key : $translate.instant('TAXE_MANAGEMENT.CREATE_TAXE'),
    link : '/taxes/create/'
  }, {
   key : $translate.instant('TAXE_MANAGEMENT.CONFIGURE_IPR'),
   link : '/taxes/ipr/'
  }, {
   key : $translate.instant('CONFIG_TAX.TITLE'),
   link : '/taxes/config_tax/'
  }];

  $scope.loadPath = function loadPath(path) {
    $location.path(path);
  };
}
