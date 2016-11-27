angular.module('bhima.controllers')
.controller('DashboardInvoiceController', DashboardInvoiceController);

DashboardInvoiceController.$inject = ['DashboardService', 'SessionService', 'NotifyService'];

function DashboardInvoiceController(Dashboard, Session, Notify) {
  var vm = this;

  Dashboard.invoices()
    .then(function (result) {
      vm.stats = result;
      vm.enterprise = Session.enterprise.currency_id;
    })
    .catch(Notify.handleError);
}
