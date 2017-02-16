angular.module('bhima.controllers')
  .controller('ModalCreditNoteController', ModalCreditNoteController);

ModalCreditNoteController.$inject = [
  '$uibModalInstance', 'PatientInvoiceService', 'data', 'VoucherService', 'NotifyService',
  '$translate', '$filter',
];

function ModalCreditNoteController(Instance, Invoices, data, Vouchers, Notify, $translate, $filter) {
  var vm = this;

  var $currency = $filter('currency');

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

    var note = angular.copy(vm.creditNote);

    var creditNoteMessage = $translate.instant('FORM.INFO.CREDIT_NOTE_INVOICE', {
      invoiceReference : vm.patientInvoice.reference,
      invoiceAmount    : $currency(vm.patientInvoice.cost, data.invoice.currency_id),
      description      : vm.creditNote.description,
      debtorName       : data.invoice.patientName,
      debtorIdentifier : data.invoice.patientReference,
    });

    note.description = creditNoteMessage;

    return Vouchers.reverse(note)
      .then(function () {
        return Instance.close(true);
      });
  }
}
