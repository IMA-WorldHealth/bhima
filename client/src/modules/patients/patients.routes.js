angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('patientsRegister', {
        url         : '/patients/register',
        controller  : 'PatientRegistrationController as PatientRegCtrl',
        templateUrl : 'modules/patients/registration/registration.html',
      })

      .state('patientEdit', {
        url         : '/patients/:uuid/edit',
        controller  : 'PatientEdit as PatientEditCtrl',
        templateUrl : 'modules/patients/edit/edit.html',
      })

      .state('patientDocuments', {
        url         : '/patients/:patient_uuid/documents',
        controller  : 'PatientDocumentsController as PatientDocCtrl',
        templateUrl : 'modules/patients/documents/documents.html',
      })

      .state('patientRegistry', {
        url         : '/patients',
        controller  : 'PatientRegistryController as PatientRegistryCtrl',
        templateUrl : '/modules/patients/registry/registry.html',
        params      : { filters: null },
      })
      .state('patientGroups', {
        url         : '/patients/groups',
        controller  : 'PatientGroupController as PatientGroupCtrl',
        templateUrl : 'modules/patients/groups/groups.html',
      })

      .state('patientRecord', {
        abstract    : true,
        url         : '/patients/:patientID',
        params      : { patientID: null },
        templateUrl : 'modules/patients/record/patient-record.html',
        controller  : 'PatientRecordController as PatientRecordCtrl',
      })
      .state('patientRecord.details', {
        url   : '',
        views : {
          'checkin@patientRecord' : {
            templateUrl : 'modules/patients/record/units/checkin.html',
            controller  : 'CheckInController as CheckInCtrl',
          },
        },
      });
  }]);
