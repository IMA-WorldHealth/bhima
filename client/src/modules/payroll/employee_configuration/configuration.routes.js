angular.module('bhima.routes')
  .config(['$stateProvider', ($stateProvider) => {
    $stateProvider
      .state('configurationEmployee', {
        url         : '/payroll/employee_configuration',
        controller  : 'ConfigurationEmployeeController as ConfigurationEmployeeCtrl',
        templateUrl : 'modules/payroll/employee_configuration/configuration.html',
      })

      .state('configurationEmployee.create', {
        url : '/create',
        params : {
          weekEnd : { value : null },
          creating : { value : true },
        },
        onEnter : ['$uibModal', configurationEmployeeModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('configurationEmployee.edit', {
        url : '/:id/edit',
        params : {
          weekEnd : { value : null },
          creating : { value : false },
        },
        onEnter : ['$uibModal', configurationEmployeeModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('configurationEmployee.config', {
        url : '/:id/config',
        params : {
          weekEnd : { value : null },
        },
        onEnter : ['$uibModal', configurationEmployee],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function configurationEmployeeModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/payroll/employee_configuration/modals/employee.modal.html',
    controller : 'EmployeeModalController as EmployeeModalCtrl',
  });
}

function configurationEmployee($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/payroll/employee_configuration/modals/config.modal.html',
    controller : 'EmployeeConfigModalController as EmployeeConfigModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
