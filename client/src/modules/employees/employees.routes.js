angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('employeeRegister', {
        url         : '/employees/register',
        controller  : 'EmployeeController as EmployeeCtrl',
        templateUrl : 'modules/employees/registration/employees.html',
      })

      .state('employeeRegistry', {
        url         : '/employees',
        controller  : 'EmployeeRegistryController as EmployeeRegistryCtrl',
        templateUrl : '/modules/employees/registry/registry.html',
        params      : {filters : null},
      });
  }]);
