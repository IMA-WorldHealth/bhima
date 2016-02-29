angular.module('bhima.controllers')
.controller('ReferenceLookupModalController', ReferenceLookupModalController);

ReferenceLookupModalController.$inject = [
  '$uibModalInstance', 'CashService', 'PatientInvoiceService',
  'JournalVoucherService', 'PurchaseOrderService', '$translate'
];

/**
 * Reference Lookup Modal Controller
 *
 * This modal contains lookups for the following documents, based on references:
 *  1) Patient Invoices
 *  2) Cash Payments
 *  3) Journal Vouchers
 *  4) Purchase Orders
 *  5) Payslips (Payroll)
 *
 * This is currently just a prototype, to be improved as services become
 * available to power the lookups.
 */
function ReferenceLookupModalController(ModalInstance, Cash, PatientInvoices, Vouchers, PurchaseOrders, $translate) {
  var vm = this;

  /** bind the dismiss method */
  vm.dismiss = ModalInstance.dismiss;
  vm.submit = submit;

  /** loading indicator */
  vm.loading = false;

  /** target paths to look up from */
  vm.targets = [{
    key : 'TREE.CASH_PAYMENTS',
    service : Cash,
    placeholder : ''
  }, {
    key : 'TREE.SALES',
    service : PatientInvoices,
    placeholder : ''
  }, {
    key : 'TREE.PURCHASE_ORDER',
    service : PurchaseOrders,
    placeholder : '',
    disabled : true
  }, {
    key : 'TREE.JOURNAL_VOUCHER',
    service: Vouchers,
    placeholder : ''

  /** @todo actually make a route for paychecks */
  }, {
    key : 'TREE.PAYROLL',
    service : function (ref)  { return angular.noop(ref); },
    placeholder : '',
    disabled : true
  }];

  vm.lookupReference = lookupReference;

  /** looks up the receipt by the reference using the correct service */
  function lookupReference() {

    // don't bother trying a lookup if there is no reference.
    if (!vm.reference) { return; }

    // clear expired data
    delete vm.receipt;
    delete vm.httpError;

    // start loading indicator
    toggleLoading();

    // look up the receipt by the reference
    var promise = vm.target.service.reference(vm.reference);

    promise.then(function (result) {
      return vm.target.service.read(result.uuid);
    })
    .then(function (receipt) {
      vm.receipt = receipt;
      
      // bind useful props
      vm.receipt.reference = vm.reference;
      vm.receipt.type = $translate.instant(vm.target.key);
    })
    .catch(function (error) {
      vm.httpError = error;
    })
    .finally(function () {
      toggleLoading();
    });
  }

  /** modal submit */
  function submit(invalid) {
    if (invalid) { return; }


    /** return the receipt retrieved from the server */
    ModalInstance.close(vm.receipt);
  }

  /** toggle modal loading */
  function toggleLoading() {
    vm.loading = !vm.loading;
  }
}
