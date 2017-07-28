angular.module('bhima.controllers')
.controller('SearchPurchaseOrderModalController', SearchPurchaseOrderModalController);

// dependencies injections
SearchPurchaseOrderModalController.$inject = [
  '$uibModalInstance', 'params', 'SupplierService', 'bhConstants', 'moment', 'Store', 'util', 'PeriodService', 'NotifyService'
];

/**
 * @class PatientRegistryModalController
 *
 * @description
 * This controller is responsible for setting up the filters for the patient
 * search functionality on the patient registry page.  Filters that are already
 * applied to the grid can be passed in via the params inject.
 */
function SearchPurchaseOrderModalController(ModalInstance, params, Suppliers, bhConstants, moment, Store, util, Periods, Notify) {
  var vm = this;
  var changes = new Store({ identifier : 'key' });
  vm.filters = params;

  vm.today = new Date();

  // bind filters if they have already been applied.  Otherwise, default to an
  // empty object.
  vm.defaultQueries = {};

  // assign default limit filter
  if (params.limit) {
    vm.defaultQueries.limit = params.limit;
  }

  // @TODO ideally these should be passed in when the modal is initialised
  //       these are known when the filter service is defined
  var searchQueryOptions = [
    'reference', 'user_id', 'supplier_uuid', 'defaultPeriod', 'is_confirmed', 'is_received', 'is_cancelled'
  ];

  // assign already defined custom params to searchQueries object
  vm.params = util.maskObjectFromKeys(params, searchQueryOptions);

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;
  vm.clear = clear;

  // Set up page elements data (debtor select data)
  vm.onSelectDebtor = onSelectDebtor;

  function onSelectDebtor(debtorGroup) {
    vm.params.debtor_group_uuid = debtorGroup.uuid;
  }

  // load suppliers
  Suppliers.read()
    .then(function (suppliers) {
      vm.suppliers = suppliers;
    })
    .catch(Notify.handleError);

  // custom filter user_id - assign the value to the params object
  vm.onSelectUser = function onSelectUser(user) {
    vm.params.user_id = user.id;
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
    angular.forEach(vm.params, function (value, key) {
      if (angular.isDefined(value)) {
        changes.post({ key : key, value : value });
      }
    });

    var loggedChanges = changes.getAll();

    // return values to the Patient Registry Controller
    return ModalInstance.close(loggedChanges);
  }

  // clears search parameters.  Custom logic if a date is used so that we can
  // clear two properties.
  function clear(value) {
    delete vm.params[value];
  }

  // dismiss the modal
  function cancel() {
    ModalInstance.close();
  }
}