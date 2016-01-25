angular.module('bhima.controllers')
.controller('PatientInvoiceController', PatientInvoiceController);

PatientInvoiceController.$inject = [];

function PatientInvoiceController() { 
  var vm = this;
  
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
