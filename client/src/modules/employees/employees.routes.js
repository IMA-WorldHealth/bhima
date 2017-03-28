angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('employees', {
        url         : '/employees',
        controller  : 'EmployeeController as EmployeeCtrl',
        templateUrl : 'modules/employees/employees.html',
      });
  }]);
