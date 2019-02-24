angular.module('bhima.controllers')
  .controller('AdmissionRegistryModalController', AdmissionRegistryModalController);

AdmissionRegistryModalController.$inject = [
  '$uibModalInstance', 'filters', 'Store', 'util', 'PeriodService', 'VisitService',
];

function AdmissionRegistryModalController(ModalInstance, filters, Store, util, Periods, Visits) {
  const vm = this;
  const changes = new Store({ identifier : 'key' });

  // displayValues will be an id:displayValue pair
  const displayValues = {};

  const searchQueryOptions = [
    'display_name', 'hospital_no', 'reference', 'start_date', 'end_date',
    'ward_name', 'room_label', 'bed_label',
  ];

  vm.filters = filters;

  vm.today = new Date();
  vm.defaultQueries = {};
  vm.searchQueries = {};

  // assign default limit filter
  if (filters.limit) {
    vm.defaultQueries.limit = filters.limit;
  }

  const lastDisplayValues = Visits.filters.getDisplayValueMap();

  // assign already defined custom filters to searchQueries object
  vm.searchQueries = util.maskObjectFromKeys(filters, searchQueryOptions);
  // keep track of the initial search queries to make sure we properly restore
  // default display values
  const initialSearchQueries = angular.copy(vm.searchQueries);

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;
  vm.clear = clear;

  vm.onSelectDebtor = function onSelectDebtor(debtorGroup) {
    vm.searchQueries.debtor_group_uuid = debtorGroup.uuid;
    displayValues.debtor_group_uuid = debtorGroup.name;
  };

  vm.onSelectProject = (project) => {
    displayValues.project_id = project.name;
    vm.searchQueries.project_id = project.id;
  };

  vm.onSelectAdmissionGroup = function onSelectAdmissionGroup(admissionGroup) {
    vm.searchQueries.admission_group_uuid = admissionGroup.uuid;
    displayValues.admission_group_uuid = admissionGroup.name;
  };

  // custom filter user_id - assign the value to the searchQueries object
  vm.onSelectUser = function onSelectUser(user) {
    vm.searchQueries.user_id = user.id;
    displayValues.user_id = user.display_name;
  };

  // default filter limit - directly write to changes list
  vm.onSelectLimit = function onSelectLimit(val) {
    // input is type value, this will only be defined for a valid number
    if (angular.isDefined(val)) {
      changes.post({ key : 'limit', value : val });
    }
  };

  // default filter period - directly write to changes list
  vm.onSelectPeriod = function onSelectPeriod(period) {
    const periodFilters = Periods.processFilterChanges(period);

    periodFilters.forEach((filterChange) => {
      changes.post(filterChange);
    });
  };


  // returns the parameters to the parent controller
  function submit() {
    // push all searchQuery values into the changes array to be applied
    angular.forEach(vm.searchQueries, (value, key) => {
      if (angular.isDefined(value)) {

        // To avoid overwriting a real display value, we first determine if the value changed in the current view.
        // If so, we do not use the previous display value.  If the values are identical, we can restore the
        // previous display value without fear of data being out of date.
        const usePreviousDisplayValue = angular.equals(initialSearchQueries[key], value)
          && angular.isDefined(lastDisplayValues[key]);

        // default to the raw value if no display value is defined
        const displayValue = usePreviousDisplayValue ? lastDisplayValues[key] : displayValues[key] || value;

        changes.post({ key, value, displayValue });
      }
    });

    const loggedChanges = changes.getAll();

    // return values to the Admission Registry Controller
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
