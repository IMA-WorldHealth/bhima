angular.module('bhima.controllers')
.controller('ModalCreditNoteController', ModalCreditNoteController);

ModalCreditNoteController.$inject = [
  '$uibModalInstance', 'PatientInvoiceService', 'util', 'data', 'JournalVoucherService'
];

function ModalCreditNoteController( $uibModalInstance, Invoices, Util, data, JournalVoucher) {
  var vm = this;
  vm.patientInvoice = data.invoice; 
  vm.submit = submit;
  vm.cancel = cancel;
  vm.creditNote;

  Invoices.read(vm.patientInvoice.uuid)    
    .then(function (data){
      vm.patientInvoiceItems = data.items;
    });

  function submit(uuid, creditNote) {
    if (!uuid) { return; }
    var journal = JournalVoucher.reverse(uuid, creditNote);
    
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
