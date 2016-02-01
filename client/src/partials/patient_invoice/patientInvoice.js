angular.module('bhima.controllers')
.controller('PatientInvoiceController', PatientInvoiceController);

PatientInvoiceController.$inject = ['$http', 'uuid'];

function PatientInvoiceController($http, uuid) { 
  var vm = this;

  // Set default invoice date to today 
  vm.invoiceDate = new Date();
  vm.invoiceId = uuid();

  // FIXME 
  vm.distributable = "true";
  vm.itemIncrement = 1;

  // TODO 02/08 - Replace with Dedrick's service API
  $http.get('services')
    .then(function (services) { 
      vm.services = services.data;

      // Select default service
      vm.service = vm.services[0];
    });

  var saleData = [];

  var mockOptions = { 
    enableSorting : false,
    enableColumnMenus : false,
    columnDefs : [
      { field : 'code' },
      { field : 'description' },
      { field : 'quantity' },
      { field : 'unit_price' },
      { field : 'amount' }
    ],
    data : saleData
  };
  
  vm.mockOptions = mockOptions;
  
  // TODO Move to items service
  vm.addInventoryItem = function addInventoryItem(totalItems) { 
    
    // TODO Validate total items is a reasonable value

    for (var i = 0; i < totalItems; i++) { 
      saleData.push({});
    }
  }
}
