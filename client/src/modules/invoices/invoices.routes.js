angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('invoiceRegistry', {
        url         : '/invoices',
        controller  : 'InvoiceRegistryController as InvoiceRegistryCtrl',
        templateUrl : '/modules/invoices/registry/registry.html',
        params      : {
          filters : null,
          display : null,
        },
      })
      .state('patientInvoice', {
        url         : '/invoices/patient',
        controller  : 'PatientInvoiceController as PatientInvoiceCtrl',
        templateUrl : 'modules/invoices/patientInvoice.html',
      });
  }]);
