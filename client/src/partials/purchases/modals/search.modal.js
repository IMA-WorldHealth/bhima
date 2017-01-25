angular.module('bhima.controllers')
.controller('SearchPurchaseOrderModalController', SearchPurchaseOrderModalController);

// dependencies injections
SearchPurchaseOrderModalController.$inject = [
  'UserService', 'SupplierService', 'NotifyService', '$uibModalInstance', 'SearchFilterFormatService'
];

function SearchPurchaseOrderModalController(Users, Suppliers, Notify, Instance, SearchFilterFormat) {
  var vm = this;

  // gloabal variables 
  var noMissingDatePart;

  // global methods
  vm.validate = validate;
  vm.cancel = Instance.close;
  vm.submit = submit;

  // init 
  init();

  // load users 
  Users.read(null, { detailled: 1 })
  .then(function (users) {
      vm.users = users;
  })
  .catch(Notify.handleError);

  // load suppliers 
  Suppliers.read(null, { detailled: 1 })
  .then(function (suppliers) {
      vm.suppliers = suppliers;
  })
  .catch(Notify.handleError);

  function init() {
    vm.bundle = { 
      dateFrom: new Date(), 
      dateTo: new Date(),
      is_confirmed: 0,
      is_received: 0,
      is_cancelled: 0
    };
    validate();
  }

  function submit() {
    var params = SearchFilterFormat.formatFilter(vm.bundle, true);
    Instance.close(params);
  }

  function validate() {
    noMissingDatePart = (vm.bundle.dateFrom && vm.bundle.dateTo) || (!vm.bundle.dateFrom && !vm.bundle.dateTo);
    vm.validDateRange = noMissingDatePart ? true : false;
  }

}
