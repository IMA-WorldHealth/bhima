angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('departments', {
        url         : '/departments',
        controller  : 'DepartementController as DepartmentCtrl',
        templateUrl : 'modules/department/department.html',
      });
  }]);
