angular.module('bhima.controllers')
  .controller('ModalCreditNoteController', ModalCreditNoteController);

ModalCreditNoteController.$inject = [
  '$uibModalInstance', 'PatientInvoiceService', 'data', 'VoucherService', 'NotifyService',
  '$translate', 'CurrencyService',
];

function ModalCreditNoteController(Instance, Invoices, data, Vouchers, Notify, $translate, CurrencyService) {
  var vm = this;

  vm.creditNote = {};
  vm.submit = submit;
  vm.cancel = function cancel() { Instance.close(false); };

  vm.creditNote.uuid = data.invoice.uuid;
  vm.patientInvoice = data.invoice;
  vm.billingAmount = 0;
  vm.subsidyAmount = 0;

  Invoices.read(data.invoice.uuid)
    .then(function (response) {
      vm.patientInvoiceItems = response.items;
      vm.currencySymbol = CurrencyService.symbol(response.currency_id);

      response.billing.filter(bill => {
        vm.billingAmount += bill.value;
      });

      response.subsidy.filter(sub => {
        vm.subsidyAmount += sub.value;
      });
    })
    .catch(Notify.handleError);

  function submit(form) {
     // stop submission if the form is invalid
    if (form.$invalid) { return; }

    var note = angular.copy(vm.creditNote);

    var creditNoteMessage = $translate.instant('FORM.INFO.CREDIT_NOTE_INVOICE', {
      invoiceReference : vm.patientInvoice.reference,
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
