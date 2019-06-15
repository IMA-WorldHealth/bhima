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
    'ward_name', 'room_label', 'bed_label', 'hospitalized', 'service_id',
    'is_pregnant', 'inside_health_zone', 'is_refered', 'is_new_case',
  ];

  vm.filters = filters;

  vm.today = new Date();
  vm.defaultQueries = {};
  vm.searchQueries = {};

  // assign default limit filter
  if (filters.limit) {
    vm.defaultQueries.limit = filters.limit;
  }

  const lastDisplayValues = Visits.grid.getDisplayValueMap();

  vm.searchQueries = util.maskObjectFromKeys(filters, searchQueryOptions);

  const initialSearchQueries = angular.copy(vm.searchQueries);

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;
  vm.clear = clear;

  vm.onSelectWard = ward => {
    vm.searchQueries.ward_uuid = ward.uuid;
    displayValues.ward_uuid = ward.name;
  };

  vm.onSelectRoom = room => {
    vm.searchQueries.room_uuid = room.uuid;
    displayValues.room_uuid = room.label;
  };

  vm.onSelectBed = bed => {
    vm.searchQueries.bed_id = bed.id;
    displayValues.bed_id = bed.label;
  };

  vm.onSelectService = service => {
    vm.searchQueries.service_id = service.id;
    displayValues.service_id = service.name;
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
