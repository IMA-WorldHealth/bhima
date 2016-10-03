angular.module('bhima.controllers')
  .controller('ModalCreditNoteController', ModalCreditNoteController);

ModalCreditNoteController.$inject = [
  '$uibModalInstance', 'PatientInvoiceService', 'data', 'VoucherService', 'NotifyService'
];

function ModalCreditNoteController(Instance, Invoices, data, Vouchers, Notify) {
  var vm = this;

  vm.creditNote = {};
  vm.submit = submit;
  vm.cancel = function () { Instance.close(false); };

  vm.creditNote.uuid = data.invoice.uuid;
  vm.patientInvoice = data.invoice;

  Invoices.read(data.invoice.uuid)
    .then(function (response) {
      vm.patientInvoiceItems = response.items;
    })
    .catch(Notify.handleError);

  function submit(form) {

     // stop submission if the form is invalid
    if (form.$invalid) { return; }

    return Vouchers.reverse(vm.creditNote)
      .then(function () {
        return Instance.close(true);
      });
  }
}
