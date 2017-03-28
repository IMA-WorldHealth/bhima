angular.module('bhima.controllers')
  .controller('InvoiceRegistrySearchModalController', InvoiceRegistrySearchModalController);

InvoiceRegistrySearchModalController.$inject = [
  '$uibModalInstance', 'UserService', 'ServiceService', 'DateService', 'filters',
  'NotifyService'
];

/**
 * @class InvoiceRegistrySearchModalController
 *
 * @description
 * This controller is responsible to collecting data from the search form and
 * returning it as a JSON object to the parent controller.  The data can be
 * preset by passing in a filters object using filtersProvider().
 */
function InvoiceRegistrySearchModalController(ModalInstance, Users, Services, Dates, filters, Notify) {
  var vm = this;

  // set controller data
  vm.params = angular.copy(filters || {});
  vm.periods = Dates.period();
  vm.today = new Date();

  // @FIXME patch hack - this should be handled by FilterService
  delete(vm.params.defaultPeriod);

  // set controller methods
  vm.submit = submit;
  vm.clear = clear;
  vm.cancel = function () { ModalInstance.close(); };

  fetchDependencies();

  function fetchDependencies() {

    Services.read()
      .then(function (services) {
        vm.services = services;
      })
      .catch(Notify.handleError);

    Users.read()
      .then(function (users) {
        vm.users = users;
      })
      .catch(Notify.handleError);
  }

  // submit the filter object to the parent controller.
  function submit(form) {
    if (form.$invalid) { return; }

    //to get it deleted at the for loop below
    var parameters = angular.copy(vm.params);

    // convert dates to strings
    if (parameters.billingDateFrom) {
      parameters.billingDateFrom = Dates.util.str(parameters.billingDateFrom);
    }

    if (parameters.billingDateTo) {
      parameters.billingDateTo = Dates.util.str(parameters.billingDateTo);
    }

    // make sure we don't have any undefined or empty parameters
    angular.forEach(parameters, function (value, key) {
      if (value === null || value === '') {
        delete parameters[key];
      }
    });

    return ModalInstance.close(parameters);
  }

  // clears search parameters.  Custom logic if a date is used so that we can
  // clear two properties.
  function clear(value) {
    if (value === 'date') {
      delete vm.params.billingDateFrom;
      delete vm.params.billingDateTo;
    } else {
      delete vm.params[value];
    }
  }
}
