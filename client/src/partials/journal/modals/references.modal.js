angular.module('bhima.controllers')
.controller('ReferenceLookupModalController', ReferenceLookupModalController);

ReferenceLookupModalController.$inject = [ '$uibModalInstance', '$timeout' ];

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
 * The module itself is simple - it is a typeahead with an async validator to
 * verfiy that the modal actually has data.
 *
 * This is currently just a prototype, to be improved as services become
 * available to power the lookups.
 */
function ReferenceLookupModalController(ModalInstance, $timeout) {
  var vm = this;

  /** bind the dismiss method */
  vm.dismiss = ModalInstance.dismiss;
  vm.submit = submit;

  /** loading indicator */
  vm.loading = false;

  /** target paths to look up from */
  vm.targets = [{
    path : '/cash/references/',
    key : 'CASH_PAYMENTS'
  }, {
    path : '/sales/references/',
    key : 'PATIENT_INVOICE'
  }, {
    path : '/purchases/references/',
    key : 'PURCHASE_ORDERS'
  }, {
    path : '/vouchers/references/',
    key : 'JOURNAL_VOUCHERS'
  }, {
    path : '/paychecks/references/',
    key : 'PAYSLIPS'
  }];

  vm.lookupReference = lookupReference;

  function lookupReference() {

    // don't bother trying a lookup if there is no reference.
    if (!vm.reference) { return; }

    delete vm.document;

    toggleLoading();

    // mock lookups
    $timeout(function () {

      // turn off loading
      toggleLoading();

      // temporary mock data
      vm.document = {
        uuid : '03a329b2-03fe-4f73-b40f-56a2870cc7e6',
        amount : 10.34,
        date : new Date(Date.parse('2016-02-03'))
      };

    }, 1200);
  }

  /** modal submit */
  function submit(invalid) {
    if (invalid) { return; }

    /** return the document retrieved from the server */
    ModalInstance.close(vm.document);
  }

  /** toggle modal loading */
  function toggleLoading() {
    vm.loading = !vm.loading;
  }
}
