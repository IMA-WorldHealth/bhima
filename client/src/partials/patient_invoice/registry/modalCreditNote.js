angular.module('bhima.controllers')
.controller('ModalCreditNoteController', ModalCreditNoteController);

ModalCreditNoteController.$inject = [
  '$uibModalInstance', 'bhConstants', 'PatientInvoiceService', 'util', 'data', 'VoucherService'
];

function ModalCreditNoteController($uibModalInstance, bhConstants, Invoices, Util, data, Vouchers) {
  var vm = this;
  vm.creditNote = {};
  vm.submit = submit;
  vm.cancel = cancel;

  vm.creditNote.uuid = data.invoice.uuid;
  vm.patientInvoice = data.invoice;

  var transferTypeId = bhConstants.transactionType.CREDIT_NOTE;


  Invoices.read(vm.creditNote.uuid)
    .then(function (data){
      vm.patientInvoiceItems = data.items;
    });

  function submit(form) {
     // stop submission if the form is invalid
    if (form.$invalid) { return; }
    vm.creditNote.type_id = transferTypeId;

    var journal = Vouchers.reverse(vm.creditNote);

    journal
      .then(function (response) {
        var data = {
          response : response
        };
        return $uibModalInstance.close(data);
      });
  }

  function cancel() {
    $uibModalInstance.dismiss();
  }
}
