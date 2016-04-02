// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('SupplierController', SupplierController);

SupplierController.$inject = [
  'SupplierService', 'CreditorService'
];

function SupplierController(supplierService, creditorService) {
  var vm = this;
  
  vm.view = 'default';
  vm.state = {};

  // bind methods
  vm.create = create;
  vm.submit = submit;
  vm.update = update;
  vm.cancel = cancel; 

  function handler(error) {
    console.error(error);
  }

  // fired on startup
  function startup() {
    // start up loading indicator
    vm.loading = true;

    // load Creditors
    creditorService.read().then(function (data) {
      vm.creditors = data;
    }).catch(handler);

    // load suppliers
    refreshSuppliers();
  }

  function cancel() {
    vm.view = 'default';
  }
  

  function create() {
    vm.view = 'create';
    vm.supplier = {};    
  }

  // switch to update mode
  // data is an object that contains all the information of a Supplier
  function update(data) {
    vm.view = 'update';
    vm.supplier = data;
  }
  
  // refresh the displayed Suppliers
  function refreshSuppliers() {
    return supplierService.read(null,{ detailed : 1 }).then(function (data) {
      vm.suppliers = data;
      vm.loading = false;
    });
  }

  // form submission
  function submit(form) {

     // stop submission if the form is invalid
    if (form.$invalid) { 
      vm.state.errored = true;
      return; 
    }

    var promise;
    var creation = (vm.view === 'create');

    var supplier = angular.copy(vm.supplier);
    
    promise = (creation) ?
      supplierService.create(supplier) :
      supplierService.update(supplier.uuid, supplier);

    promise
      .then(function (response) {
        return refreshSuppliers();
      })
      .then(function () {
        vm.view = creation ? 'create_success' : 'update_success';
      })      
      .catch(handler);
  }

  startup();  
}