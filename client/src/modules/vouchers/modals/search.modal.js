angular.module('bhima.controllers')
  .controller('VoucherRegistrySearchModalController', VoucherRegistrySearchModalController);

VoucherRegistrySearchModalController.$inject = [
  '$uibModalInstance', 'UserService', 'DateService', 'filters', 'NotifyService',
];

/**
 * @class VoucherRegistrySearchModalController
 *
 * @description
 * This controller is responsible to collecting data from the search form and
 * returning it as a JSON object to the parent controller.  The data can be
 * preset by passing in a filters object using filtersProvider().
 */
function VoucherRegistrySearchModalController(ModalInstance, Users, Dates, filters, Notify) {
  var vm = this;

  // set controller data
  vm.params = angular.copy(filters || {});

  // set controller methods
  vm.submit = submit;
  vm.clear = clear;
  vm.cancel = function cancel() { ModalInstance.close(); };

  fetchDependencies();

  function fetchDependencies() {
    Users.read()
      .then(function (users) {
        vm.users = users;
      })
      .catch(Notify.handleError);
  }

  // submit the filter object to the parent controller.
  function submit(form) {
    var parameters;

    if (form.$invalid) { return; }

    // to get it deleted at the for loop below
    parameters = angular.copy(vm.params);

    // convert dates to strings
    if (parameters.dateFrom) {
      parameters.dateFrom = Dates.util.str(parameters.dateFrom);
    }

    if (parameters.dateTo) {
      parameters.dateTo = Dates.util.str(parameters.dateTo);
    }

    // make sure we don't have any undefined or empty parameters
    angular.forEach(parameters, function (value, key) {
      if (value === null || value === '') {
        delete parameters[key];
      }
    });

    ModalInstance.close(parameters);
  }

  // clears search parameters.  Custom logic if a date is used so that we can
  // clear two properties.
  function clear(value) {
    if (value === 'date') {
      delete vm.params.dateFrom;
      delete vm.params.dateTo;
    } else {
      delete vm.params[value];
    }
  }
}
