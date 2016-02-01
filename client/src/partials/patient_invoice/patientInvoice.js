angular.module('bhima.controllers')
.controller('PatientInvoiceController', PatientInvoiceController);

PatientInvoiceController.$inject = ['uuid'];

function PatientInvoiceController(uuid) { 
  var vm = this;
  
  // Set default invoice date to today 
  vm.invoiceDate = new Date();
  vm.invoiceId = uuid();

  var mockOptions = { 
    enableSorting : false,
    gridMenuShowHideColumns : false,
    columnDefs : [
      { field : 'Quanity' },
      { field : 'Code' },
      { field : 'Description' },
      { field : 'Unit Price' },
      { field : 'Amount' }
    ]
  };

  vm.mockOptions = mockOptions;
}
