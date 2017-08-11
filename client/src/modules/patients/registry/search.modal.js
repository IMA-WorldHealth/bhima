angular.module('bhima.controllers')
.controller('PatientRegistryModalController', PatientRegistryModalController);

PatientRegistryModalController.$inject = [
  '$uibModalInstance', 'filters',
  'bhConstants', 'moment', 'Store', 'util', 'PeriodService'
];

/**
 * @class PatientRegistryModalController
 *
 * @description
 * This controller is responsible for setting up the filters for the patient
 * search functionality on the patient registry page.  Filters that are already
 * applied to the grid can be passed in via the filters inject.
 */
function PatientRegistryModalController(ModalInstance, filters, bhConstants, moment, Store, util, Periods) {
  var vm = this;
  var changes = new Store({ identifier : 'key' });
  vm.filters = filters;


  vm.today = new Date();
  vm.defaultQueries = {};
  vm.searchQueries = {};

  // assign default limit filter
  if (filters.limit) {
    vm.defaultQueries.limit = filters.limit;
  }

  // @TODO ideally these should be passed in when the modal is initialised these are known when the filter service is defined
  var searchQueryOptions = [
    'display_name', 'sex', 'hospital_no', 'reference', 'dateBirthFrom', 'dateBirthTo', 'dateRegistrationFrom', 'dateRegistrationTo',
    'debtor_group_uuid', 'patient_group_uuid', 'user_id', 'defaultPeriod'
  ];

  // assign already defined custom filters to searchQueries object
  vm.searchQueries = util.maskObjectFromKeys(filters, searchQueryOptions);

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;
  vm.clear = clear;

  vm.onSelectDebtor = function onSelectDebtor(debtorGroup) {
    vm.searchQueries.debtor_group_uuid = debtorGroup.uuid;
  }

  vm.onSelectPatientGroup = function onSelectPatientGroup(patientGroup) {
    vm.searchQueries.patient_group_uuid = patientGroup.uuid;
  }

  // custom filter user_id - assign the value to the searchQueries object
  vm.onSelectUser = function onSelectUser(user) {
    vm.searchQueries.user_id = user.id;
  };

  // default filter limit - directly write to changes list
  vm.onSelectLimit = function onSelectLimit(value) {
    // input is type value, this will only be defined for a valid number
    if (angular.isDefined(value)) {
      changes.post({ key : 'limit', value : value });
    }
  };

  // default filter period - directly write to changes list
  vm.onSelectPeriod = function onSelectPeriod(period) {
    var periodFilters = Periods.processFilterChanges(period);

    periodFilters.forEach(function (filterChange) {
      changes.post(filterChange);
    });
  };


  // returns the parameters to the parent controller
  function submit(form) {
    // push all searchQuery values into the changes array to be applied
    angular.forEach(vm.searchQueries, function (value, key) {
      if (angular.isDefined(value)) {
        changes.post({ key : key, value : value });
      }
    });

    var loggedChanges = changes.getAll();

    // return values to the Patient Registry Controller
    return ModalInstance.close(loggedChanges);
  }

  function clear(value) {
    delete vm.searchQueries[value];
  }

  // dismiss the modal
  function cancel() {
    ModalInstance.close();
  }
}