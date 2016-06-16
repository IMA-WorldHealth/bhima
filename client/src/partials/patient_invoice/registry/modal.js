angular.module('bhima.controllers')
.controller('InvoiceRegistryModalController', InvoiceRegistryModalController);

InvoiceRegistryModalController.$inject = [
  '$uibModalInstance', 'PatientInvoiceService', 'PatientService', 'ProjectService', 'UserService', 'ServiceService', 'util', 'DateService'
];

function InvoiceRegistryModalController( $uibModalInstance, Invoices, Patients, Projects, Users, Services, Util, DateService) {
  var vm = this;

  vm.period = DateService.period();

  vm.submit = submit;
  vm.cancel = cancel;
  vm.setTimes = setTimes;
  vm.today = new Date();
  vm.invoice = {};

  Projects.read()
      .then(function (data) {
        vm.projects = data;        
      });

  Services.read()
      .then(function (data) {
          vm.services = data;
      });

  Users.read()
      .then(function (data){
        vm.users = data;
      });

  function submit(form) {
    if (form.$invalid) { return; }
    vm.invoice = Util.clean(vm.invoice);

    var invoice = angular.copy(vm.invoice);
      var promise = Invoices.search(invoice);
      var invoiceFilters = Invoices.invoiceFilters(invoice);

    promise
        .then(function (response) {
          var data = {
            response : response,
            filters   : invoiceFilters
          };
          return $uibModalInstance.close(data);
        });
  }

  function setTimes(times){
    //billingDateTo can be at most today
    vm.invoice.billingDateTo = new Date();

    switch (times) {
      case 'today' :
        vm.invoice.billingDateFrom = new Date();
        break;
      case 'week' :
        vm.invoice.billingDateFrom = DateService.previous.week();
        break;
      case 'month' :
        vm.invoice.billingDateFrom = DateService.previous.month();
        break;
      default:
        vm.invoice.billingDateFrom = DateService.previous.year();
    }
  }

  function cancel() {
    $uibModalInstance.dismiss();
  }
}
