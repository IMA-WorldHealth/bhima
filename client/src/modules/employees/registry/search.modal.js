angular.module('bhima.controllers')
  .controller('EmployeeRegistryModalController', EmployeeRegistryModalController);

EmployeeRegistryModalController.$inject = [
  '$uibModalInstance', 'bhConstants', 'moment', 'ServiceService', 'Store',
  'util', 'filters', 'EmployeeService',
];

/**
 * @class EmployeeRegistryModalController
 *
 * @description
 * This controller is responsible for setting up the filters for the employee
 * search functionality on the employee registry page.
 */
function EmployeeRegistryModalController(ModalInstance, bhConstants, moment, Services, Store, util, filters, Employees) {
  var vm = this;
  var changes = new Store({ identifier : 'key' });

  // displayValues will be an id:displayValue pair
  var displayValues = {};

  vm.filters = filters;
  vm.searchQueries = {};
  vm.defaultQueries = {};
  vm.formatHiringDates = formatHiringDates;

  var lastDisplayValues = Employees.filters.getDisplayValueMap();

  // these properties will be used to filter employee data form the client
  var searchQueryOptions = [
    'display_name', 'sex', 'code', 'dateBirthFrom', 'dateBirthTo', 'dateEmbaucheFrom',
    'dateEmbaucheTo', 'grade_uuid', 'fonction_id', 'service_id', 'is_medical',
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

  // custom filter service_id - assign the value to the searchQueries object
  vm.onSelectService = function onSelectService(service) {
    displayValues.service_id = service.name;
    vm.searchQueries.service_id = service.id;
  };

  // custom filter grade_uuid - assign the value to the searchQueries object
  vm.onSelectGrade = function onSelectGrade(grade) {
    displayValues.grade_uuid = grade.text;
    vm.searchQueries.grade_uuid = grade.uuid;
  };

  // custom filter fonction_id - assign the value to the searchQueries object
  vm.onSelectFonction = function onSelectFonction(fonction) {
    displayValues.fonction_id = fonction.fonction_txt;
    vm.searchQueries.fonction_id = fonction.id;
  };

  // clears search parameters.  Custom logic if a date is used so that we can
  // clear two properties.
  function clear(key) {
    delete vm.searchQueries[key];
  }

  // dismiss the modal
  function cancel() {
    ModalInstance.close();
  }

  // stores the hiring dates in the display value
  function formatHiringDates() {
    if (vm.searchQueries.dateEmbaucheFrom) {
      displayValues.dateEmbaucheFrom = vm.searchQueries.dateEmbaucheFrom;
    }

    if (vm.searchQueries.dateEmbaucheTo) {
      displayValues.dateEmbaucheTo = vm.searchQueries.dateEmbaucheTo;
    }
  }

  // returns the parameters to the parent controller
  function submit(form) {
    if (form.$invalid) { return; }

    // push all searchQuery values into the changes array to be applied
    angular.forEach(vm.searchQueries, function (value, key) {
      if (angular.isDefined(value)) {
        // default to the original value if no display value is defined
        var displayValue = displayValues[key] || lastDisplayValues[key] || value;
        changes.post({ key : key, value : value, displayValue : displayValue });
      }
    });

    var loggedChanges = changes.getAll();
    return ModalInstance.close(loggedChanges);
  }


   // default filter limit - directly write to changes list
  vm.onSelectLimit = function onSelectLimit(value) {
    // input is type value, this will only be defined for a valid number
    if (angular.isDefined(value)) {
      changes.post({ key : 'limit', value : value });
    }
  };
}
