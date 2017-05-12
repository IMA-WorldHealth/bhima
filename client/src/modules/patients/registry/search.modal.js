angular.module('bhima.controllers')
.controller('PatientRegistryModalController', PatientRegistryModalController);

PatientRegistryModalController.$inject = [
  '$uibModalInstance', 'params', 'DebtorGroupService', 'PatientGroupService',
  'bhConstants', 'moment'
];

/**
 * @class PatientRegistryModalController
 *
 * @description
 * This controller is responsible for setting up the filters for the patient
 * search functionality on the patient registry page.  Filters that are already
 * applied to the grid can be passed in via the params inject.
 */
function PatientRegistryModalController(ModalInstance, params, DebtorGroups, PatientGroupsService, bhConstants, moment) {
  var vm = this;
  vm.today = new Date();

  // bind filters if they have already been applied.  Otherwise, default to an
  // empty object.
  vm.params = params || {};

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;
  vm.clear = clear;

  DebtorGroups.read()
    .then(function (result) {
      vm.debtorGroups = result;
    });

  PatientGroupsService.read()
    .then(function (result) {
      vm.patientGroups = result;
    });

  // custom filter user_id - assign the value to the params object
  vm.onSelectUser = function onSelectUser(user) {
    vm.params.user_id = user.id;
  };

  // returns the parameters to the parent controller
  function submit(form) {
    if (form.$invalid) { return; }

    var parameters = angular.copy(vm.params);

    // convert dates to strings
    if (parameters.dateRegistrationFrom) {
      parameters.dateRegistrationFrom = moment(parameters.dateRegistrationFrom).format('YYYY-MM-DD');
    }

    if (parameters.dateRegistrationTo) {
      parameters.dateRegistrationTo = moment(parameters.dateRegistrationTo).format('YYYY-MM-DD');
    }

    if (parameters.dateBirthFrom) {
      parameters.dateBirthFrom = moment(parameters.dateBirthFrom).format('YYYY-MM-DD');
    }

    if (parameters.dateBirthTo) {
      parameters.dateBirthTo = moment(parameters.dateBirthTo).format('YYYY-MM-DD');
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

  // dismiss the modal
  function cancel() {
    ModalInstance.close();
  }
}
