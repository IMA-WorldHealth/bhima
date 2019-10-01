angular.module('bhima.controllers')
  .controller('ReferenceSearchModalController', ReferenceSearchModalController);

ReferenceSearchModalController.$inject = [
  '$uibModalInstance', 'filters', 'Store', 'util', 'PatientService', 'AccountService',
];

/**
 * @class ReferenceSearchModalController
 *
 * @description
 * This controller is responsible for setting up the filters for the Account Reference
 * search functionality on the Account Reference registry page.  Filters that are already
 * applied to the grid can be passed in via the filters inject.
 */
function ReferenceSearchModalController(ModalInstance, filters, Store, util, Patients, Accounts) {
  const vm = this;
  const changes = new Store({ identifier : 'key' });

  // displayValues will be an id:displayValue pair
  const displayValues = {};

  const searchQueryOptions = [
    'abbr', 'number', 'description', 'reference_type_id', 'is_exception',
  ];

  vm.filters = filters;

  vm.today = new Date();
  vm.defaultQueries = {};
  vm.searchQueries = {};
  vm.select = {};
  vm.clear = clear;
  vm.clearAccount = clearAccount;
  vm.onSelectAccountReferenceType = onSelectAccountReferenceType;

  Accounts.read()
    .then(elements => {
      // bind the accounts to the controller
      const accounts = Accounts.order(elements);
      vm.accounts = accounts;
    });


  const lastDisplayValues = Patients.filters.getDisplayValueMap();

  // assign already defined custom filters to searchQueries object
  vm.searchQueries = util.maskObjectFromKeys(filters, searchQueryOptions);
  // keep track of the initial search queries to make sure we properly restore
  // default display values
  const initialSearchQueries = angular.copy(vm.searchQueries);

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;

  function clear(key) {
    delete vm.searchQueries[key];
  }

  function clearAccount(key) {
    delete vm.select[key];
  }

  // callback for Account Reference Type
  function onSelectAccountReferenceType(referenceType) {
    vm.searchQueries.reference_type_id = referenceType.id;
    displayValues.reference_type_id = referenceType.label;
  }

  // returns the parameters to the parent controller
  function submit() {
    if (vm.select.account) {
      vm.searchQueries.number = vm.select.account.number;
      displayValues.number = `${vm.select.account.number} - ${vm.select.account.label}`;
    } else {
      vm.searchQueries.number = null;
      displayValues.number = null;
    }

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

    // return values to the Patient Registry Controller
    return ModalInstance.close(loggedChanges);
  }

  // dismiss the modal
  function cancel() {
    ModalInstance.close();
  }
}
