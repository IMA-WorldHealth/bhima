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
  var vm = this;

  // @TODO ideally these should be passed in when the modal is initialised these are known when the filter service is defined
  var searchQueryOptions = [
    'code', 'group_uuid', 'consumable', 'label', 'type_id', 'price',
  ];

  var changes = new Store({ identifier : 'key' });
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

  // assign already defined custom filters to searchQueries object
  vm.searchQueries = util.maskObjectFromKeys(filters, searchQueryOptions);

  Inventory.Groups.read()
    .then(function (result) {
      vm.inventoryGroups = result;
    })
    .catch(Notify.handleError);

  // Inventory Type
  Inventory.Types.read()
    .then(function (types) {
      vm.types = types;
    })
    .catch(Notify.handleError);

  // default filter limit - directly write to changes list
  vm.onSelectLimit = function onSelectLimit(value) {
    // input is type value, this will only be defined for a valid number
    if (angular.isDefined(value)) {
      changes.post({ key : 'limit', value : value });
    }
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
