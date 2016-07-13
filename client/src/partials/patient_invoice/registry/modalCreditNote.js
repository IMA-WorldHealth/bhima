angular.module('bhima.controllers')
.controller('ModalCreditNoteController', ModalCreditNoteController);

ModalCreditNoteController.$inject = [
  '$uibModalInstance', 'PatientInvoiceService', 'util', 'data', 'VoucherService'
];

function ModalCreditNoteController( $uibModalInstance, Invoices, Util, data, Vouchers) {
  var vm = this;
  vm.creditNote = {};
  vm.submit = submit;
  vm.cancel = cancel;

  vm.creditNote.uuid = data.invoice.uuid; 
  vm.patientInvoice = data.invoice;
  // transfer type
  vm.transferType = Vouchers.transferType;

  var typeId = vm.transferType.filter(function (item) {
    return item.incomeExpense === 'creditNote';
  });

  var transferTypeId = typeId[0].id;


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
