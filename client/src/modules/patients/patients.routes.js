angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
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
        params      : {
          filters : [],
        },
      })
      .state('patientGroups', {
        url         : '/patients/groups',
        controller  : 'PatientGroupController as PatientGroupCtrl',
        templateUrl : 'modules/patients/groups/groups.html',
      })

      .state('patientRecord', {
        url         : '/patients/:patientUuid',
        params      : { patientUuid : null },
        templateUrl : 'modules/patients/record/patient-record.html',
        controller  : 'PatientRecordController as PatientRecordCtrl',
      })

      .state('patientVisitRegistry', {
        url         : '/patients/visits',
        templateUrl : 'modules/patients/visits/registry.html',
        controller  : 'AdmissionRegistryController as AdmissionRegistryCtrl',
        params      : {
          filters : [],
        },
      });
  }]);
