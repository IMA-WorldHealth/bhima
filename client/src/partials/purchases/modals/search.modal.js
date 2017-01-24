angular.module('bhima.controllers')
.controller('SearchPurchaseOrderModalController', SearchPurchaseOrderModalController);

// dependencies injections
SearchPurchaseOrderModalController.$inject = [
  'UserService', 'SupplierService', 'NotifyService', '$uibModalInstance'
];

function SearchPurchaseOrderModalController(Users, Suppliers, Notify, Instance) {
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
      vm.users = users
  })
  .catch(Notify.handleError);

  // load suppliers 
  Suppliers.read(null, { detailled: 1 })
  .then(function (suppliers) {
      vm.suppliers = suppliers
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
    var queryParam = formatFilterParameters(vm.bundle, true);
    var params = formatFilterValues(queryParam);
    Instance.close(params);
  }

  function validate() {
    noMissingDatePart = (vm.bundle.dateFrom && vm.bundle.dateTo) || (!vm.bundle.dateFrom && !vm.bundle.dateTo);
    vm.validDateRange = noMissingDatePart ? true : false;
  }

  // clean bundle
  function formatFilterParameters(element, WITH_NULL_VALUES) {
    var out = {};
    for (var i in element) {
      if (WITH_NULL_VALUES) {
        out[i] = element[i];
      } else if (element[i]) {
        out[i] = element[i];
      }
    }
    return out;
  }

  /**
   * @function formatFilterValues
   * @description identifier and display value
   * @param {object} formatedFilters a returned value of formatFilterParameters
   * @return {object} fomatedValues { identifiers: {}, display: {} }
   */
  function formatFilterValues(formatedFilters) {
    var out = { identifiers: {}, display: {} };
    for (var key in formatedFilters) {

      if (!formatedFilters.hasOwnProperty(key)) { continue; }

      // get identifiers
      out.identifiers[key] = typeof(formatedFilters[key]) === 'object' ?
        formatedFilters[key].uuid || formatedFilters[key].id || formatedFilters[key] : formatedFilters[key];

      // get value to display
      out.display[key] = typeof(formatedFilters[key]) === 'object' ?
        formatedFilters[key].text || formatedFilters[key].label || formatedFilters[key].display_name || formatedFilters[key] : formatedFilters[key];
    }

    return out;
  }

}
