angular.module('bhima.controllers')
.controller('EmployeeRegistryModalController', EmployeeRegistryModalController);

EmployeeRegistryModalController.$inject = [
  '$uibModalInstance', 'FunctionService', 'GradeService',
  'bhConstants', 'moment', 'ServiceService', 'Store', 'util', 'filters'
];

/**
 * @class EmployeeRegistryModalController
 *
 * @description
 * This controller is responsible for setting up the filters for the employee
 * search functionality on the employee registry page.
 */
function EmployeeRegistryModalController(ModalInstance, Functions, Grades, bhConstants, moment, Services, Store, util, filters) {
  var vm = this;
  var changes = new Store({identifier : 'key'});

  vm.filters = filters;
  vm.searchQueries = {};
  vm.defaultQueries = {};
  vm.today = new Date();

  // these properties will be used to filter employee data form the client
  var searchQueryOptions = [
    'display_name', 'sex', 'code', 'dateBirthFrom', 'dateBirthTo', 'dateEmbaucheFrom',
    'dateEmbaucheTo', 'grade_id', 'fonction_id', 'service_id',
  ];

  // assign already defined custom filters to searchQueries object
  vm.searchQueries = util.maskObjectFromKeys(filters, searchQueryOptions);

  // assign default filters
  if (filters.limit) {
    vm.defaultQueries.limit = filters.limit;
  }

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


  // clears search parameters.  Custom logic if a date is used so that we can
  // clear two properties.
  function clear(key) {
     delete vm.searchQueries[key];
  }

  // dismiss the modal
  function cancel() {
    ModalInstance.close();
  }

  // returns the parameters to the parent controller
  function submit(form) {
    // push all searchQuery values into the changes array to be applied
    angular.forEach(vm.searchQueries, function (value, key) {
      if (angular.isDefined(value)) {
        changes.post({ key : key, value : value });
      }
    });

    var loggedChanges = changes.getAll();
    return ModalInstance.close(loggedChanges);
  }
}
