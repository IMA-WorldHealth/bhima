angular.module('bhima.controllers')
  .controller('PatientEdit', PatientEdit);

PatientEdit.$inject = [
  '$stateParams', 'PatientService', 'util', 'moment', 'NotifyService',
  'ScrollService', 'PatientGroupModal', 'DateService', 'bhConstants'
];

function PatientEdit($stateParams, Patients, util, moment, Notify, ScrollTo, GroupModal, Dates, Constants) {
  var vm = this;
  var referenceId = $stateParams.uuid;

  vm.patient = null;
  vm.unknownId = false;

  // maxlength field for Patient Registration
  // @todo - move this to a config param
  vm.maxLength = util.maxTextLength;
  vm.length150 = util.length150;
  vm.length50 = util.length50;
  vm.length40 = util.length40;
  vm.length30 = util.length30;
  vm.length12 = util.length12;

  if (referenceId) {
    buildPage(referenceId);
  }

  // datepicker options
  vm.datePickerOptions = {
    maxDate : new Date(),
    minDate : Constants.dates.minDob,
    popup : Constants.dayOptions.format
  };

  vm.datePickerIsOpen = false;

  function buildPage(patientId) {
    collectPatient(patientId)
      .then(function () {

        return collectGroups(patientId);
      })
      .catch(function (error) {

        // handle error and update view to show no results - this could be improved
        Notify.handleError(error);
        vm.unknownId = true;
      });
  }

  function collectPatient(patientId) {

    // TODO Full patient/details object should be passed through find patient directive
    // 1. Only download id + name in patient directive
    // 2. Download full patients/details on selection
    return Patients.read(patientId)
      .then(function (patient) {

        formatPatientAttributes(patient);
        vm.medical = patient;
      });
  }

  function formatPatientAttributes(patient) {

    // Sanitise DOB for Date Input
    patient.dob = new Date(patient.dob);

    // Assign name
    patient.name = patient.display_name;
    patient.displayGender = patient.sex;
    patient.displayAge = moment().diff(patient.dob, 'years');
  }

  function collectGroups(patientId) {
    Patients.groups(patientId)
      .then(function (result) {
        vm.finance = {patientGroups : result};
      });
  }

  // Update the view to reflect changes made in update modal
  function updateDebtorModel(debtorGroupUuid, debtorGroupName) {
    vm.medical.debtor_group_uuid = debtorGroupUuid;
    vm.medical.debtor_group_name = debtorGroupName;
    Notify.success('FORM.INFO.UPDATE_SUCCESS');
  }

  // Update the view to reflect changes made in update modal
  function updatePatientGroupsModel(updated) {
    vm.finance.patientGroups = [];
    Notify.success('FORM.INFO.UPDATE_SUCCESS');
    vm.finance.patientGroups = updated;
  }

  // TODO Clearer naming conventions
  vm.updatePatient = function updatePatient(patientDetailsForm) {
    var submitPatient;

    if (patientDetailsForm.$pristine) {
      Notify.warn('PATIENT_EDIT.RECORD_SAME');
      return;
    }

    if (patientDetailsForm.$invalid) {
      Notify.danger('FORM.ERRORS.RECORD_ERROR');
      return;
    }

    submitPatient = util.filterFormElements(patientDetailsForm, true);

    return Patients.update(vm.medical.uuid, submitPatient)
      .then(function (updatedPatient) {
        Notify.success('FORM.INFO.UPDATE_SUCCESS');

        // Update view
        formatPatientAttributes(updatedPatient);
        vm.medical = updatedPatient;

        // Reset forms dirty values
        patientDetailsForm.$setPristine();
        patientDetailsForm.$submitted = false;
      })
      .catch(Notify.handleError);
  };

  vm.updateDebtorGroup = function updateDebtorGroup() {
    GroupModal.updateDebtor(vm.medical, updateDebtorModel);
  };

  vm.updatePatientGroups = function updatePatientGroups() {
    GroupModal.updateGroupConfig(vm.medical, vm.finance.patientGroups, updatePatientGroupsModel);
  };

  vm.scrollToSubmission = function scrollToSubmission() {
    ScrollTo('submission');
  };
}
