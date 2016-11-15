angular.module('bhima.controllers')
.controller('InvoiceRegistrySearchModalController', InvoiceRegistrySearchModalController);

InvoiceRegistrySearchModalController.$inject = [
  '$uibModalInstance', 'PatientInvoiceService', 'PatientService',
  'ProjectService', 'UserService', 'ServiceService', 'DateService', 'filters',
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
function InvoiceRegistrySearchModalController(ModalInstance, Invoices, Patients, Projects, Users, Services, Dates, filters, Notify) {
  var vm = this;

  // set controller data
  vm.params = angular.copy(filters || {});
  vm.periods = Dates.period();
  vm.today = new Date();

  // set controller methods
  vm.submit = submit;
  vm.clear = clear;
  vm.cancel = function () { ModalInstance.close(); };
  vm.setDateRange = setDateRange;
  vm.onPatientSearchApiCallback = onPatientSearchApiCallback;
  vm.setPatient = setPatient;

  Projects.read()
    .then(function (projects) {
      vm.projects = projects;
    })
    .catch(Notify.handleError);

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

  // submit the filter object to the parent controller.
  function submit(form) {
    if (form.$invalid) { return; }

    var parameters = vm.params;

    // make sure we don't have any undefined or empty parameters
    angular.forEach(parameters, function (value, key) {
      if (value === null || value === '') {
        delete parameters[key];
      }
    });

    return ModalInstance.close(parameters);
  }

  // sets the start and end dates of the date input searches
  function setDateRange(range) {
    // billingDateTo can be at most today
    vm.params.billingDateTo = new Date();

    switch (range) {
      case 'today' :
        vm.params.billingDateFrom = Dates.current.day();
        break;
      case 'week' :
        vm.params.billingDateFrom = Dates.previous.week();
        break;
      case 'month' :
        vm.params.billingDateFrom = Dates.previous.month();
        break;
      default:
        vm.params.billingDateFrom = Dates.previous.year();
    }
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

  // register the patient search api
  function onPatientSearchApiCallback(api) {
    vm.patientSearchApi = api;
  }

  function setPatient(patient) {
    vm.params.patientUuid = patient.uuid;
    vm.params.patientNames = patient.display_name;
  }

}
