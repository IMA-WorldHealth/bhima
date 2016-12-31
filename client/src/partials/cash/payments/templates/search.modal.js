angular.module('bhima.controllers')
.controller('SearchCashPaymentModalController', SearchCashPaymentModalController);

// dependencies injections
SearchCashPaymentModalController.$inject = [
  'DebtorService', 'UserService', 'CashboxService', 'NotifyService', '$uibModalInstance', 'CurrencyService'
];

/**
 * Search Cash Payment controller
 */
function SearchCashPaymentModalController(Debtors, Users, Cashboxes, Notify, Instance, Currencies) {
  var vm = this;

  // global variables
  var noMissingDatePart;
  var isObject = angular.isObject;

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
   * @param {object} formattedFilters a returned value of formatFilterParameters
   * @return {object} formattedValues { identifiers: {}, display: {} }
   */
  function formatFilterValues(formattedFilters) {
    var out = { identifiers: {}, display: {} };

    for (var key in formattedFilters) {

      if (!formattedFilters.hasOwnProperty(key)) { continue; }

      // get identifiers
      out.identifiers[key] = isObject(formattedFilters[key]) ?
        formattedFilters[key].uuid || formattedFilters[key].id || formattedFilters[key] : formattedFilters[key];

      // get value to display
      out.display[key] = isObject(formattedFilters[key]) ?
        formattedFilters[key].text || formattedFilters[key].label || formattedFilters[key].display_name || formattedFilters[key] : formattedFilters[key];
    }

    return out;
  }

}
