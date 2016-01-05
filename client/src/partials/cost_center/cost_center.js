angular.module('bhima.controllers')
.controller('CostCenterController', CostCenterController);

CostCenterController.$inject = [
  '$location', '$translate'
];

/**
* Cost Center Controller
* This controller is responsible for managing menu in cost center
*/
function CostCenterController ($location, $translate) {
  var vm = this,
      configuration = vm.configuration = {};

  configuration.operations = [{
    key : $translate.instant('COST_CENTER.OPERATIONS.CC'),
    link : '/cost_center/center/'
  }, {
    key : $translate.instant('COST_CENTER.OPERATIONS.VERSEMENT'),
    link : '/cost_center/allocation/'
  }, {
    key : $translate.instant('COST_CENTER.OPERATIONS.ASSIGN'),
    link : '/cost_center/assigning/'
  }];

  vm.loadPath = function loadPath(path) {
    $location.path(path);
  };
}
