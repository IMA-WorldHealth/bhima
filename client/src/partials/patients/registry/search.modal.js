angular.module('bhima.controllers')
.controller('PatientRegistryModalController', PatientRegistryModalController);

PatientRegistryModalController.$inject = [
  '$uibModalInstance', 'PatientService', 'DateService', 'params'
];

/**
 * @class PatientRegistryModalController
 *
 * @description
 * This controller is responsible for setting up the filters for the patient
 * search functionality on the patient registry page.  Filters that are already
 * applied to the grid can be passed in via the params inject.
 */
function PatientRegistryModalController(ModalInstance, Patients, Dates, params) {
  var vm = this;

  // bind period labels from the service
  vm.periods = Dates.period();
  vm.today = new Date();

  // bind filters if they have already been applied.  Otherwise, default to an
  // empty object.
  vm.params = params || {};

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;
  vm.clear = clear;
  vm.setDateRange = setDateRange;

  // returns the parameters to the parent controller
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

  // clears search parameters.  Custom logic if a date is used so that we can
  // clear two properties.
  function clear(value) {
    if (value === 'registration') {
      delete vm.params.dateRegistrationFrom;
      delete vm.params.dateRegistrationTo;
    } else if (value === 'dob') {
      delete vm.params.dateBirthFrom;
      delete vm.params.dateBirthTo;
    } else {
      delete vm.params[value];
    }
  }

  // sets the date range for date inputs
  function setDateRange(type, range) {

    // the parameter key we will be setting
    var key = (type === 'registration') ?
      'dateRegistrationFrom' : 'dateBirthFrom';

    // set the end date to today
    if (type === 'registration') {
      vm.params.dateRegistrationTo = new Date();
    } else {
      vm.params.dateBirthTo = new Date();
    }

    vm.range = range;

    switch (range) {
      case 'today' :
        vm.params[key] = new Date();
        break;
      case 'week' :
        vm.params[key] = Dates.previous.week();
        break;
      case 'month' :
        vm.params[key] = Dates.previous.month();
        break;
      default:
        vm.params[key] = Dates.previous.year();
    }
  }

  // dismiss the modal
  function cancel() {
    ModalInstance.close();
  }
}
