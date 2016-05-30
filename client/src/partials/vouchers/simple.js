angular.module('bhima.controllers')
.controller('SimpleJournalVoucherController', SimpleJournalVoucherController);

SimpleJournalVoucherController.$inject = [
  'AppCache', 'VoucherService', 'AccountService', 'SessionService', 'util',
  'NotifyService'
];

/**
 * @class SimpleJournalVouchers
 *
 * This module implements simply journal vouchers, crafted specially for cash
 * transactions, but usable in any generic transactions that only require two
 * Posting Journal lines.  It allows users to quickly create transactions by
 * specifying two accounts and an amount to transfer between them.
 *
 * @todo - Implement caching mechanism for incomplete forms (via AppCache)
 * @todo - Implement Voucher Templates to allow users to save pre-selected
 * forms (via AppCache and the breadcrumb component).
 */
function SimpleJournalVoucherController(AppCache, Vouchers, Accounts, Session, util, Notify) {
  var vm = this;

  // cache to save work-in-progress data and pre-fabricated templates
  var cache = AppCache('JournalVouchers');

  vm.maxLength = util.maxTextLength;
  vm.paths = [
    { label : 'TREE.FINANCE' },
    { label : 'VOUCHERS.SIMPLE.TITLE' }
  ];

  // bind the submit method
  vm.submit = submit;

  // load the list of accounts
  Accounts.read()
  .then(function (accounts) {
    vm.accounts = accounts;
  });

  /* run the module on startup and refresh */
  function startup() {

    // current timestamp to limit date
    vm.timestamp = new Date();

    // set up default voucher values
    vm.voucher = {};
    vm.voucher.date = new Date();
    vm.voucher.currency_id = Session.enterprise.currency_id;
  }

  function submit(form) {

    // stop submission if the form is invalid
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.RECORD_ERROR');
      return;
    }

    // submit the voucher
    return Vouchers.createSimple(vm.voucher)
    .then(function (res) {
      Notify.success('FORM.INFO.UPDATE_SUCCESS');

      /* setup the voucher object to init state */
      form.$setPristine();

      // rerun the startup script
      startup();
    })
    .catch(Notify.handleError);
  }

  startup();
}
