angular.module('bhima.routes')
  .config(['$stateProvider', ($stateProvider) => {
    $stateProvider
      .state('employeeRegister', {
        abstract : true,
        url         : '/employees/registration',
        controller  : 'EmployeeController as EmployeeCtrl',
        templateUrl : 'modules/employees/registration/employees.html',
      })

      .state('employeeRegister.register', {
        url         : '/register',
      })

      .state('employeeRegister.employeeEdit', {
        url         : '/:uuid/edit',
      })
      .state('employeeRegister.patientAsEmployee', {
        url         : '/:uuid/patientAsEmployee',
        params : {
          saveAsEmployee : { value : true },
        },
      })
      .state('employeeRegistry', {
        url         : '/employees',
        controller  : 'EmployeeRegistryController as EmployeeRegistryCtrl',
        templateUrl : '/modules/employees/registry/registry.html',
        params      : {
          filters : [],
        },
      });
  }]);
