angular.module('bhima.controllers')
.controller('SimpleJournalVoucherController', SimpleJournalVoucherController);

SimpleJournalVoucherController.$inject = [
  'VoucherService', 'AccountService', 'SessionService', 'util',
  'NotifyService',  'ReceiptModal','bhConstants', '$rootScope', 'VoucherForm', '$translate'
];

/**
 * @class SimpleJournalVouchers
 *
 * This module implements simply journal vouchers, crafted specially for cash
 * transactions, but usable in any generic transactions that only require two
 * Posting Journal lines.  It allows users to quickly create transactions by
 * specifying two accounts and an amount to transfer between them.
 *
 * CONVENTION:
 *  First line (index 0) is the DEBIT side
 *  Second line (index 1) is the CREDIT side
 *
 * @todo - Implement Voucher Templates to allow users to save pre-selected
 * @todo - use VoucherForm
 * forms (via AppCache and the breadcrumb component).
 */
function SimpleJournalVoucherController(Vouchers, Accounts, Session, util, Notify, Receipts, bhConstants, RS, VoucherForm, $translate) {
  var vm = this;

  vm.bhConstants = bhConstants;

  // bind the voucher form to the view
  vm.Voucher = new VoucherForm('SimpleVoucher');

  // global variables
  vm.maxLength = util.maxTextLength;

  // expose methods to the view
  vm.submit = submit;
  vm.clear = clear;

  // format voucher types and bind to the view
  Vouchers.transactionType()
    .then(function (list) {

      // make sure that the items are translated
      list.data.forEach(function (item) {
        item.hrText = $translate.instant(item.text);
      });

      // bind to the view
      vm.types = list.data;
    })
    .catch(Notify.handleError);

  vm.timestamp = new Date();

  function submit(form) {

    // stop submission if the form is invalid
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.RECORD_ERROR');
      return;
    }

    // CONVENTION: 0 is debit, 1 is credit
    var debitRow = vm.Voucher.store.data[0];
    var creditRow = vm.Voucher.store.data[1];

    // configure as needed
    debitRow.configure({ debit : vm.amount });
    creditRow.configure({ credit : vm.amount });

    var valid = vm.Voucher.validate();

    if (!valid) {
      Notify.danger(vm.Voucher._error);
      return;
    }

    var voucher = vm.Voucher.details;
    voucher.items = vm.Voucher.store.data;

    // submit the voucher
    return Vouchers.create(voucher)
      .then(function (res) {
        Receipts.voucher(res.uuid, true);

        // clear the form to refresh it.
        clear();

        // setup the voucher object to init state
        form.$setPristine();
      })
      .catch(Notify.handleError);
  }

  function clear() {

    // current timestamp to limit date
    vm.timestamp = new Date();

    // clear the voucher
    vm.Voucher.clear();

    // amount is held outside of the voucher
    delete vm.amount;
  }

  RS.$on('voucher:configure', function (evt, data) {

    // configure the basics of the transaction type.
    vm.Voucher.details.description = data.description;
    vm.Voucher.details.type_id = data.type_id;

    vm.amount = data.amount;

    var debitRow = vm.Voucher.store.data[0];
    var creditRow = vm.Voucher.store.data[1];

    if (data.debit) {
      debitRow.configure(data.debit);
    }

    if (data.credit) {
      creditRow.configure(data.credit);
    }

    vm.Voucher.validate();
  });
}
