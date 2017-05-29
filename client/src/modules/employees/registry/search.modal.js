angular.module('bhima.controllers')
.controller('EmployeeRegistryModalController', EmployeeRegistryModalController);

EmployeeRegistryModalController.$inject = [
  '$uibModalInstance', 'params', 'FunctionService', 'GradeService',
  'bhConstants', 'moment', 'ServiceService'
];

/**
 * @class EmployeeRegistryModalController
 *
 * @description
 * This controller is responsible for setting up the filters for the employee
 * search functionality on the employee registry page.
 */
function EmployeeRegistryModalController(ModalInstance, params, Functions, Grades, bhConstants, moment, Services) {
  var vm = this;
  vm.today = new Date();

  // bind filters if they have already been applied.  Otherwise, default to an
  // empty object.
  vm.params = params || {};

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;
  vm.clear = clear;

  Grades.read()
    .then(function (grades) {
      vm.grades = grades;
    });

  Functions.read()
    .then(function (functions) {
      vm.functions = functions;
    });

  Services.read()
    .then(function (services) {
      vm.services = services;
    });

  // returns the parameters to the parent controller
  function submit(form) {
    if (form.$invalid) { return; }

    var parameters = angular.copy(vm.params);

    // to get the format of data from Database
    var formatDB = bhConstants.dates.formatDB;

    // convert dates to strings
    if (parameters.dateEmbaucheFrom) {
      parameters.dateEmbaucheFrom = moment(parameters.dateEmbaucheFrom).format(formatDB);
    }

    if (parameters.dateEmbaucheTo) {
      parameters.dateEmbaucheTo = moment(parameters.dateEmbaucheTo).format(formatDB);
    }

    if (parameters.dateBirthFrom) {
      parameters.dateBirthFrom = moment(parameters.dateBirthFrom).format(formatDB);
    }

    if (parameters.dateBirthTo) {
      parameters.dateBirthTo = moment(parameters.dateBirthTo).format(formatDB);
    }

    // make sure we don't have any undefined or empty parameters
    angular.forEach(parameters, function (value, key) {
      if (value === null || value === '') {
        delete parameters[key];
      }
    });

    return ModalInstance.close(parameters);
  }

  // clears search parameters.  Custom logic if a date is used so that we can
  // clear two properties.
  function clear(value) {
    if (value === 'embauche') {
      delete vm.params.dateEmbaucheFrom;
      delete vm.params.dateEmbaucheTo;
    } else if (value === 'dob') {
      delete vm.params.dateBirthFrom;
      delete vm.params.dateBirthTo;
    } else {
      delete vm.params[value];
    }
  }

  // dismiss the modal
  function cancel() {
    ModalInstance.close();
  }
}
