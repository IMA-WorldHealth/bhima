angular.module('bhima.routes')
  .config(['$stateProvider', function invoiceRoutes($stateProvider) {
    $stateProvider
      .state('invoiceRegistry', {
        url         : '/invoices',
        controller  : 'InvoiceRegistryController as InvoiceRegistryCtrl',
        templateUrl : '/modules/invoices/registry/registry.html',
        params      : { filters : [] },
      })
      .state('patientInvoice', {
        url         : '/invoices/patient',
        controller  : 'PatientInvoiceController as PatientInvoiceCtrl',
        templateUrl : 'modules/invoices/patientInvoice.html',
      });
  }]);
