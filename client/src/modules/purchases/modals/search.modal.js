angular.module('bhima.controllers')
.controller('SearchPurchaseOrderModalController', SearchPurchaseOrderModalController);

SearchPurchaseOrderModalController.$inject = [
  '$uibModalInstance', 'params', 'Store',
  'util', 'PeriodService', 'NotifyService', 'PurchaseOrderService', '$translate',
];

/**
 * @class SearchPurchaseOrderModalController
 *
 * @description
 * This controller is responsible for setting up the filters for the Purchase Order
 * search functionality on the Purchase Order registry page.  Filters that are already
 * applied to the grid can be passed in via the params inject.
 */
function SearchPurchaseOrderModalController(ModalInstance, params, Store, util, Periods, Notify, PurchaseOrder, $translate) {
  var vm = this;
  var changes = new Store({ identifier : 'key' });
  vm.filters = params;
  vm.searchQueries = {};
  vm.defaultQueries = {};

  vm.today = new Date();

  // @TODO ideally these should be passed in when the modal is initialised
  //       these are known when the filter service is defined
  var searchQueryOptions = [
    'reference', 'user_id', 'supplier_uuid', 'defaultPeriod', 'status_id'
  ];

  // displayValues will be an id:displayValue pair
  var displayValues = {};
  var lastDisplayValues = PurchaseOrder.filters.getDisplayValueMap();

  // load all Purchase status
  PurchaseOrder.purchaseState()
    .then(function (status) {
      status.forEach(function (item) {
        item.plainText = $translate.instant(item.text);
      });
      vm.purchaseStatus = status;
    })
    .catch(Notify.handleError);

  // assign already defined custom params to searchQueries object
  vm.searchQueries = util.maskObjectFromKeys(params, searchQueryOptions);

  // assign default limit filter
  if (params.limit) {
    vm.defaultQueries.limit = params.limit;
  }

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;
  vm.clear = clear;

  // custom filter user_id - assign the value to the params object
  vm.onSelectUser = function onSelectUser(user) {
    displayValues.user_id = user.display_name;
    vm.searchQueries.user_id = user.id;
  };

  // custom filter supplier_uuid - assign the value to the params object
  vm.onSelectSupplier = function onSelectSupplier(supplier) {
    displayValues.supplier_uuid = supplier.display_name;
    vm.searchQueries.supplier_uuid = supplier.uuid;
  };


  vm.onPurchaseStatusChange = function onPurchaseStatusChange(purchaseStatus) {
    vm.searchQueries.status_id = purchaseStatus;
    var statusText = '/';

    purchaseStatus.forEach(function (statusId) {
      vm.purchaseStatus.forEach(function (status) {
        if (statusId === status.id) {
          statusText += status.plainText + ' / ';
        }
      });
    });

    displayValues.status_id = statusText;
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
        // default to the original value if no display value is defined
        var displayValue = displayValues[key] || lastDisplayValues[key] || value;
        changes.post({ key: key, value: value, displayValue: displayValue });
      }
    });

    var loggedChanges = changes.getAll();

    // return values to the Purchase Order Registry Controller
    return ModalInstance.close(loggedChanges);
  }

  // clears search parameters.  Custom logic if a date is used so that we can clear two properties
  function clear(value) {
    delete vm.searchQueries[value];
  }

  // dismiss the modal
  function cancel() {
    ModalInstance.close();
  }
}
