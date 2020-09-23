angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {

    $stateProvider.state('staffing_indices', {
      url : '/staffing_indices',
      templateUrl : 'modules/payroll/staffing_indice/staffingIndice.html',
      controller : 'StaffingIndiceController as StaffingIndiceCtrl',
      params : { filters : [] },
    });
  }]);
