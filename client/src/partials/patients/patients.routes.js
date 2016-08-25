angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('patientsRegister', {
        url : '/patients/register',
        controller: 'PatientRegistrationController as PatientRegCtrl',
        templateUrl: 'partials/patients/registration/registration.html'
      })

      .state('patientEdit', {
        url : '/patients/:uuid/edit',
        controller: 'PatientEdit as PatientEditCtrl',
        templateUrl: 'partials/patients/edit/edit.html'
      })

      .state('patientDocuments', {
        url    : '/patients/:patient_uuid/documents',
        controller  : 'PatientDocumentsController as PatientDocCtrl',
        templateUrl : 'partials/patients/documents/documents.html'
      })

      .state('patientInvoice', {
        url : '/invoices/patient',
        controller : 'PatientInvoiceController as PatientInvoiceCtrl',
        templateUrl : 'partials/patient_invoice/patientInvoice.html'
      })

      .state('patientRegistry', {
        url  : '/patients',
        controller: 'PatientRegistryController as PatientRegistryCtrl',
        templateUrl: '/partials/patients/registry/registry.html'
      })
      .state('patientGroups', {
        url : '/patients/groups',
        controller: 'PatientGroupController as PatientGroupCtrl',
        templateUrl: 'partials/patients/groups/groups.html'
      })

      .state('patientRecord', {
        abstract : true,
        url : '/patients/:patientID',
        templateUrl: 'partials/patients/record/patient_record.html',
        controller: 'PatientRecordController as PatientRecordCtrl'
      })
      .state('patientRecord.details', {
        url : '',
        views : {
          'checkin@patientRecord' : {
            templateUrl : 'partials/patients/record/units/checkin.html',
            controller : 'CheckInController as CheckInCtrl'
          }
        }
      });
  }]);
