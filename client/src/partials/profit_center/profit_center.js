angular.module('bhima.controllers')
.controller('ProfitCenterController', ProfitCenterController);

ProfitCenterController.$inject = [
  '$location', '$translate'
];

/**
* Profit Center Controller
* This controller is responsible for managing menu in profit center
*/
function ProfitCenterController ($location, $translate) {
  var vm = this,
      configuration = vm.configuration = {};

  configuration.operations = [{
    key : $translate.instant('PROFIT_CENTER.OPERATIONS.CC'),
    link : '/profit_center/center/'
  }, {
    key : $translate.instant('PROFIT_CENTER.OPERATIONS.VERSEMENT'),
    link : '/profit_center/allocation/'
  }];

  vm.loadPath = function loadPath(path) {
    $location.path(path);
  };
}
