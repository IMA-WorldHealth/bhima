angular.module('bhima.controllers')
.controller('SearchCashPaymentModalController', SearchCashPaymentModalController);

// dependencies injections
SearchCashPaymentModalController.$inject = [
  'DebtorService', 'UserService', 'CashboxService', 'NotifyService', '$uibModalInstance'
];

/**
 * Search Cash Payment controller
 */
function SearchCashPaymentModalController(Debtors, Users, Cashboxes, Notify, Instance) {
  var vm = this;

  // global variables
  var noMissingDatePart;

  // expose to the view
  vm.bundle = {};
  vm.validate = validate;
  vm.submit = submit;
  vm.cancel = Instance.close;

  // client
  Debtors.read()
  .then(function (list) {
    vm.debtors = list;
  })
  .catch(Notify.handleError);

  // cashboxes
  Cashboxes.read()
  .then(function (list) {
    vm.cashboxes = list;
  })
  .catch(Notify.handleError);

  // users
  Users.read()
  .then(function (list) {
    vm.users = list;
  })
  .catch(Notify.handleError);

  function submit() {
    var queryParam = formatFilterParameters(vm.bundle);
    var params = formatFilterValues(queryParam);
    Instance.close(params);
  }

  function validate() {
    noMissingDatePart = (vm.bundle.dateFrom && vm.bundle.dateTo) || (!vm.bundle.dateFrom && !vm.bundle.dateTo);
    vm.validDateRange = noMissingDatePart ? true : false;
  }

  // clean bundle
  function formatFilterParameters() {
    var out = {};
    for (var i in vm.bundle) {
      if (vm.bundle[i]) {
        out[i] = vm.bundle[i];
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
