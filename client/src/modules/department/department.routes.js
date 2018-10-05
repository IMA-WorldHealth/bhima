angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('department', {
        url         : '/department',
        controller  : 'DepartementController as DepartmentCtrl',
        templateUrl : 'modules/department/department.html',
      });
  }]);
