// TODO Known bug: If a patients hospital number is updated the original registered value will still
// be the only value ignored by the validation - the new value will be reported as an error if changed 'already registered'

// TODO Refactor patient find directive to not use $scope.watch
// TODO No action is taken if default parameter is not a valid patient

// FIXME Patient UUID reference downloads and searches for patient redundantly
// this should be addressed by updating the find patient directive to only return a UUID
// and have the page responsible for using the UUID as required (potentially optionally?)

// TODO Address location/ routing hack, deep linking functionality should not be implemented
// in a different way by every controller - apply uniform (routing?) standards across pages
angular.module('bhima.controllers')
.controller('PatientEdit', PatientEdit);

PatientEdit.$inject = [
  '$scope', '$translate', '$stateParams', '$anchorScroll',
  '$uibModal', 'PatientService', 'util', 'moment', 'NotifyService',
  'ScrollService', 'PatientGroupModal'
];

function PatientEdit($scope, $translate, $stateParams, $anchorScroll, $uibModal, patients, util, moment, Notify, ScrollTo, GroupModal) {
  var viewModel = this;
  var referenceId = $stateParams.uuid;

  viewModel.patient = null;
  viewModel.unknownId = false;
  viewModel.minDOB = util.minDOB;
  viewModel.maxDOB = util.maxDOB;


  if (referenceId) {
    buildPage(referenceId);
  }

  function buildPage(patientId) {
    collectPatient(patientId)
      .then(function (result) {

        return collectGroups(patientId);
      })
      .catch(function (error) {

        viewModel.unknownId = true;
      });
  }

  function collectPatient(patientId) {

    // TODO Full patient/details object should be passed through find patient directive
    // 1. Only download id + name in patient directive
    // 2. Download full patients/details on selection
    return patients.detail(patientId)
      .then(function (patient) {

        formatPatientAttributes(patient);
        viewModel.medical = patient;
      });
  }

  function formatPatientAttributes(patient) {

    // Sanitise DOB for HTML Date Input
    patient.dob = new Date(patient.dob);

    // Assign name
    patient.name = patient.first_name.concat(
          ' ', patient.middle_name,
          ' ', patient.last_name);

    // Assign age
    // FIXME Translate value is not returned unless page is fully initialised - this will usually fail on refresh
    /*$translate('PATIENT_EDIT.'.concat(patient.sex))
      .then(function (res) { patient.displayGender = res; });*/

    patient.displayGender = patient.sex;
    patient.displayAge = moment().diff(patient.dob, 'years');
  }

  function collectGroups(patientId) {
    patients.groups(patientId)
      .then(function (result) {
        viewModel.finance = {patientGroups : result};
      });
  }

  // Update the view to reflect changes made in update modal
  function updateDebtorModel(debtorGroupUuid, debtorGroupName) {
    viewModel.medical.debtor_group_uuid = debtorGroupUuid;
    viewModel.medical.debtor_group_name = debtorGroupName;
    viewModel.updatedDebtorGroup = true;
  }

  // Update the view to reflect changes made in update modal
  function updatePatientGroupsModel(updated) {
    viewModel.updatedPatientGroups = true;
    viewModel.finance.patientGroups = [];

    viewModel.finance.patientGroups = updated;
  }

  // TODO Clearer naming conventions
  viewModel.updatePatient = function updatePatient(patientDetailsForm) {
    var submitPatient;
    patientDetailsForm.$setSubmitted();

    if (patientDetailsForm.$pristine) {
      Notify.warn('PATIENT_EDIT.RECORD_SAME');
      return;
    }

    if (patientDetailsForm.$invalid) {
      Notify.danger('FORM.ERRORS.RECORD_ERROR');
      return;
    }

    submitPatient = util.filterDirtyFormElements(patientDetailsForm);

    // TODO Use latest data formatting/ sanitastion standards
    // Ensure date is submitted in a valid format
    if (submitPatient.dob) {
      submitPatient.dob = util.sqlDate(submitPatient.dob);
    }

    patients.update(viewModel.medical.uuid, submitPatient)
      .then(function (updatedPatient) {

        Notify.success('FORM.INFOS.UPDATE_SUCCESS');

        // Update view
        formatPatientAttributes(updatedPatient);
        viewModel.medical = updatedPatient;

        // Reset forms dirty values
        patientDetailsForm.$setPristine();
        patientDetailsForm.$submitted = false;
      })
      .catch(Notify.handleError);
  };

  viewModel.updateDebtorGroup = function updateDebtorGroup() {

    // Reset updated flag
    viewModel.updatedDebtorGroup = false;

    GroupModal.updateDebtor(viewModel.medical, updateDebtorModel);
  };

  viewModel.updatePatientGroups = function updatePatientGroups() {

    // Reset updated flag
    viewModel.updatedPatientGroups = false;

    GroupModal.updateGroupConfig(viewModel.medical, viewModel.finance.patientGroups, updatePatientGroupsModel);
  };

  viewModel.scrollToSubmission = function scrollToSubmission() {
    ScrollTo('submission');
  };
}
