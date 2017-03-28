angular.module('bhima.controllers')
  .controller('SupplierController', SupplierController);

SupplierController.$inject = [
  'SupplierService', 'CreditorGroupService', 'util', 'NotifyService'
];

function SupplierController(Suppliers, CreditorGroups, util, Notify) {
  var vm = this;

  vm.view = 'default';
  vm.state = {};

  // bind methods
  vm.create = create;
  vm.submit = submit;
  vm.update = update;
  vm.cancel = cancel;

  vm.maxLength = util.maxTextLength;
  vm.loading = false;

  // fired on startup
  function startup() {

    // load Creditors
    CreditorGroups.read()
      .then(function (groups) {
        vm.groups = groups;
      })
      .catch(Notify.handleError);

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

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  // refresh the displayed Suppliers
  function refreshSuppliers() {

    // start up loading indicator
    toggleLoadingIndicator();

    return Suppliers.read(null, { detailed : 1 })
      .then(function (suppliers) {
        vm.suppliers = suppliers;
      })
      .catch(Notify.handleError)
      .finally(toggleLoadingIndicator);
  }

  // form submission
  function submit(form) {

     // stop submission if the form is invalid
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.HAS_ERRORS');
      return;
    }

    var promise;
    var creation = (vm.view === 'create');

    var supplier = angular.copy(vm.supplier);

    promise = (creation) ?
      Suppliers.create(supplier) :
      Suppliers.update(supplier.uuid, supplier);

    promise
      .then(function (response) {
        return refreshSuppliers();
      })
      .then(function () {
        var message = creation ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(message);
        vm.view = 'default';
      })
      .catch(Notify.handleError);
  }

  startup();
}
