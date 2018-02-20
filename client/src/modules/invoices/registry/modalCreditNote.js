angular.module('bhima.controllers')
  .controller('ModalCreditNoteController', ModalCreditNoteController);

ModalCreditNoteController.$inject = [
  '$uibModalInstance', 'PatientInvoiceService', 'data', 'VoucherService',
  'NotifyService', '$translate', 'CurrencyService', 'bhConstants', '$state',
  '$filter',
];

function ModalCreditNoteController(
  Instance, Invoices, data, Vouchers, Notify, $translate, CurrencyService,
  bhConstants, $state, $filter
) {
  const vm = this;
  vm.Constants = bhConstants;

  const $currency = $filter('currency');

  vm.creditNote = {};
  vm.submit = submit;
  vm.goToPatientLink = goToPatientLink;
  vm.cancel = () => Instance.close(false);

  vm.creditNote.uuid = data.invoice.uuid;
  vm.invoice = data.invoice;
  vm.billingAmount = 0;
  vm.subsidyAmount = 0;

  Invoices.read(data.invoice.uuid)
    .then(response => {
      vm.invoice.description = response.description;
      vm.invoiceItems = response.items;
      vm.currencySymbol = CurrencyService.symbol(response.currency_id);

      vm.billingAmount = response.billing.reduce((a, b) => a + b.value, 0);
      vm.subsidyAmount = response.subsidy.reduce((a, b) => a + b.value, 0);

      vm.hasBillingServices = vm.billingAmount > 0;
      vm.hasSubsidies = vm.subsidyAmount > 0;
      vm.hasExpandedFooter = vm.hasBillingServices || vm.hasSubsidies;

      vm.alertI18nValues = {
        invoiceReference : vm.invoice.reference,
        patientName : vm.invoice.patientName,
        patientReference : vm.invoice.patientReference,
        cost : $currency(vm.invoice.cost, vm.invoice.currency_id),
      };
    })
    .catch(Notify.handleError);

  // Link to the patient registry
  function goToPatientLink() {
    Instance.close(false);
    $state.go('patientRegistry', {
      filters : [{
        key : 'debtor_uuid',
        value : vm.invoice.debtor_uuid,
        displayValue : vm.invoice.patientName,
      }],
    });
  }

  function submit(form) {
    // stop submission if the form is invalid
    if (form.$invalid) { return 0; }

    const note = angular.copy(vm.creditNote);

    const creditNoteMessage = $translate.instant('FORM.INFO.CREDIT_NOTE_INVOICE', {
      invoiceReference : vm.invoice.reference,
      description      : vm.creditNote.description,
      debtorName       : data.invoice.patientName,
      debtorIdentifier : data.invoice.patientReference,
    });

    note.description = creditNoteMessage;

    return Vouchers.reverse(note)
      .then(() => Instance.close(true));
  }
}
