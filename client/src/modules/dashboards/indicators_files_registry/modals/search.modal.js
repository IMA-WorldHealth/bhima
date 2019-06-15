angular.module('bhima.controllers')
  .controller('SearchIndicatorsFilesModalController', SearchIndicatorsFilesModalController);

SearchIndicatorsFilesModalController.$inject = [
  '$uibModalInstance', 'filters', 'Store', 'util', 'PeriodService',
  'IndicatorsDashboardService', 'NotifyService', '$translate',
];

function SearchIndicatorsFilesModalController(
  ModalInstance, filters, Store, util, Periods,
  IndicatorsDashboard, Notify, $translate
) {
  const vm = this;
  const changes = new Store({ identifier : 'key' });

  // displayValues will be an id:displayValue pair
  const displayValues = {};

  const searchQueryOptions = [
    'fiscal_year_id', 'period_id', 'type_id', 'status_id', 'service_id', 'user_id',
  ];

  vm.filters = filters;
  vm.today = new Date();
  vm.defaultQueries = {};
  vm.searchQueries = {};

  // assign default limit filter
  if (filters.limit) {
    vm.defaultQueries.limit = filters.limit;
  }

  const lastDisplayValues = IndicatorsDashboard.indicatorsFilesGridFilterer.getDisplayValueMap();

  vm.searchQueries = util.maskObjectFromKeys(filters, searchQueryOptions);

  const initialSearchQueries = angular.copy(vm.searchQueries);

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;
  vm.clear = clear;

  // load status
  IndicatorsDashboard.status.read()
    .then(status => {
      vm.status = status.map(translateKey);
    })
    .catch(Notify.errorHandler);

  // load types
  IndicatorsDashboard.types.read()
    .then(types => {
      vm.types = types.map(translateKey);
    })
    .catch(Notify.errorHandler);

  vm.onSelectPeriod = selected => {
    vm.searchQueries.period_id = selected.period && selected.period.id ? selected.period.id : undefined;
    vm.searchQueries.fiscal_year_id = selected.fiscal && selected.fiscal.id ? selected.fiscal.id : undefined;
  };

  vm.onSelectService = service => {
    vm.searchQueries.service_id = service.id;
  };

  vm.onSelectType = type => {
    vm.searchQueries.type_id = type.id;
  };

  vm.onSelectStatus = status => {
    vm.searchQueries.status_id = status.id;
  };

  vm.onSelectUser = user => {
    vm.searchQueries.user_id = user.id;
  };

  // default filter limit - directly write to changes list
  vm.onSelectLimit = function onSelectLimit(val) {
    // input is type value, this will only be defined for a valid number
    if (angular.isDefined(val)) {
      changes.post({ key : 'limit', value : val });
    }
  };

  // transalte keys
  function translateKey(item) {
    item.hrText = $translate.instant(item.translate_key);
    return item;
  }


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

  function clear(...value) {
    for (let i = 0; i < value.length; i++) {
      const element = value[i];
      delete vm.searchQueries[element];
    }
  }

  // dismiss the modal
  function cancel() {
    ModalInstance.close();
  }
}
