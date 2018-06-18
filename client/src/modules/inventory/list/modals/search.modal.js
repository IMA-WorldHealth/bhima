angular.module('bhima.controllers')
  .controller('InventorySearchModalController', InventorySearchModalController);

InventorySearchModalController.$inject = [
  '$uibModalInstance', 'NotifyService', 'filters', 'InventoryService', 'Store', 'util',
];

/**
 * @class InventorySearchModalController
 *
 * @description
 * This controller is responsible for setting up the filters for the Inventory
 * search functionality on the Inventory list.  Filters that are already
 * applied to the grid can be passed in via the filters inject.
 */
function InventorySearchModalController(ModalInstance, Notify, filters, Inventory, Store, util) {
  const vm = this;

  const searchQueryOptions = [
    'code', 'group_uuid', 'consumable', 'text', 'locked',
    'label', 'type_id', 'price',
  ];

  const changes = new Store({ identifier : 'key' });

  // displayValues will be an id:displayValue pair
  const displayValues = {};

  vm.filters = filters;

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;
  vm.clear = clear;

  vm.today = new Date();
  vm.defaultQueries = {};
  vm.searchQueries = {};

  // assign default limit filter
  if (filters.limit) {
    vm.defaultQueries.limit = filters.limit;
  }

  const lastDisplayValues = Inventory.filters.getDisplayValueMap();

  // assign already defined custom filters to searchQueries object
  vm.searchQueries = util.maskObjectFromKeys(filters, searchQueryOptions);
  // keep track of the initial search queries to make sure we properly restore
  // default display values
  const initialSearchQueries = angular.copy(vm.searchQueries);


  // default filter limit - directly write to changes list
  vm.onSelectLimit = function onSelectLimit(val) {
    // input is type value, this will only be defined for a valid number
    if (angular.isDefined(val)) {
      changes.post({ key : 'limit', value : val });
    }
  };

  // custom filter group_uuid - assign the value to the searchQueries object
  vm.onSelectGroup = function onSelectGroup(group) {
    displayValues.group_uuid = group.name;
    vm.searchQueries.group_uuid = group.uuid;
  };

  // custom filter type_id - assign the value to the searchQueries object
  vm.onSelectType = function onSelectType(type) {
    displayValues.type_id = type.text;
    vm.searchQueries.type_id = type.id;
  };

  // returns the parameters to the parent controller
  function submit() {
    // push all searchQuery values into the changes array to be applied
    angular.forEach(vm.searchQueries, (value, key) => {
      if (angular.isDefined(value)) {
        // To avoid overwriting a real display value, we first determine if the value changed in the current view.
        // If so, we do not use the previous display value.  If the values are identical, we can restore the
        // previous display value without fear of data being out of date.
        const usePreviousDisplayValue =
          angular.equals(initialSearchQueries[key], value) &&
          angular.isDefined(lastDisplayValues[key]);
        // default to the raw value if no display value is defined
        const displayValue = usePreviousDisplayValue ? lastDisplayValues[key] : displayValues[key] || value;

        changes.post({ key, value, displayValue });
      }
    });

    const loggedChanges = changes.getAll();

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
