angular.module('bhima.controllers')
  .controller('SearchPurchaseOrderModalController', SearchPurchaseOrderModalController);

// dependencies injections
SearchPurchaseOrderModalController.$inject = [
  'SupplierService', 'NotifyService', '$uibModalInstance', 'SearchFilterFormatService',
];

function SearchPurchaseOrderModalController(Suppliers, Notify, Instance, SearchFilterFormat) {
  var vm = this;

  // global variables
  var noMissingDatePart;

  // global methods
  vm.validate = validate;
  vm.cancel = Instance.close;
  vm.submit = submit;

  // init
  init();

  // load suppliers
  Suppliers.read()
    .then(function (suppliers) {
      vm.suppliers = suppliers;
    })
    .catch(Notify.handleError);

  function init() {
    vm.bundle = {
      dateFrom : new Date(),
      dateTo   : new Date(),
    };

    validate();
  }

  // custom filter user_id - assign the value to the bundle object
  vm.onSelectUser = function onSelectUser(user) {
    vm.bundle.user_id = user.id;
  };

  function submit() {
    var params = SearchFilterFormat.formatFilter(vm.bundle, true);
    Instance.close(params);
  }

  function validate() {
    noMissingDatePart = (vm.bundle.dateFrom && vm.bundle.dateTo) || (!vm.bundle.dateFrom && !vm.bundle.dateTo);
    vm.validDateRange = noMissingDatePart ? true : false;
  }
}
