angular.module('bhima.controllers')
  .controller('PatientEdit', PatientEdit);

PatientEdit.$inject = [
  '$stateParams', 'PatientService', 'util', 'moment', 'NotifyService',
  'ScrollService', 'PatientGroupModal', 'bhConstants', '$timeout',
];

function PatientEdit($stateParams, Patients, util, moment, Notify, ScrollTo, GroupModal, Constants, $timeout) {
  const vm = this;
  const referenceId = $stateParams.uuid;

  vm.medical = {};
  vm.patient = null;
  vm.unknownId = false;
  vm.onSelectLocationOrigin = onSelectLocationOrigin;
  vm.onSelectLocationCurrent = onSelectLocationCurrent;

  function onSelectLocationOrigin(location) {
    vm.medical.origin_location_id = location.uuid;
  }

  function onSelectLocationCurrent(location) {
    vm.medical.current_location_id = location.uuid;
  }

  vm.origin = '';

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
    popup : Constants.dayOptions.format,
  };

  vm.datePickerIsOpen = false;

  function buildPage(patientId) {
    collectPatient(patientId)
      .then(() => {

        return collectGroups(patientId);
      })
      .catch((error) => {

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
      .then((patient) => {
        vm.origin = patient.hospital_no;
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
      .then((result) => {
        vm.finance = { patientGroups : result };
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
    if (patientDetailsForm.$pristine) {
      Notify.warn('PATIENT_EDIT.RECORD_SAME');
      return 0;
    }

    if (patientDetailsForm.$invalid) {
      Notify.danger('FORM.ERRORS.RECORD_ERROR');
      return 0;
    }

    const submitPatient = util.filterFormElements(patientDetailsForm, true);

    if (vm.medical.origin_location_id) {
      submitPatient.origin_location_id = vm.medical.origin_location_id;
    }

    if (vm.medical.current_location_id) {
      submitPatient.current_location_id = vm.medical.current_location_id;
    }

    return Patients.update(vm.medical.uuid, submitPatient)
      .then((updatedPatient) => {
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
    GroupModal.updateDebtor(vm.medical, updateDebtorModel)
      .then(() => {
        vm.refreshDebtorGroupHistory = true;
        $timeout(() => { vm.refreshDebtorGroupHistory = false; }, 250);
      });
  };

  vm.updatePatientGroups = function updatePatientGroups() {
    GroupModal.updateGroupConfig(vm.medical, vm.finance.patientGroups, updatePatientGroupsModel);
  };

  vm.scrollToSubmission = function scrollToSubmission() {
    ScrollTo('submission');
  };
}
