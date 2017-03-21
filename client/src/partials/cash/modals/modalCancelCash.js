angular.module('bhima.controllers')
  .controller('ModalCancelCashController', ModalCancelCashController);

ModalCancelCashController.$inject = [
  '$uibModalInstance', 'CashService', 'data', 'VoucherService', 'NotifyService'
];

function ModalCancelCashController(Instance, Cash, data, Vouchers, Notify) {
  var vm = this;

  vm.cancelCash = {};
  vm.submit = submit;
  vm.cancel = function () { Instance.close(false); };

  vm.cancelCash.uuid = data.invoice.uuid;
  vm.patientInvoice = data.invoice;

  Cash.read(data.invoice.uuid)
    .then(function (response) {
      vm.cashData = response;
    })
    .catch(Notify.handleError);

  function submit(form) {
     // stop submission if the form is invalid
    if (form.$invalid) { return; }

    return Vouchers.reverse(vm.cancelCash)
      .then(function () {
        return Instance.close(true);
      })
      .catch(Notify.handleError)
      .finally(function () {
        Instance.close();
      });
  }
}
