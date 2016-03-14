angular.module('bhima.controllers')
.controller('SimpleJournalVoucherController', SimpleJournalVoucherController);

SimpleJournalVoucherController.$inject = [
  'AppCache', 'VoucherService', '$translate', 'AccountService',
  'CurrencyService', 'SessionService'
];

/**
 * Simple Journal Vouchers
 *
 * This module implements simply journal vouchers, crafted specially for cash
 * transactions, but useable in any generic transactions that only require two
 * Posting Journal lines.  It allows users to quickly create transactions by
 * specifying two accounts and an amount to transfer between them.
 *
 * @constructor
 *
 * @todo - Implement caching mechanism for incomplete forms (via AppCache)
 * @todo - Implement Voucher Templates to allow users to save pre-selected
 * forms (via AppCache and the breadcrumb component).
 */
function SimpleJournalVoucherController(AppCache, Vouchers, $translate, Accounts, Currencies, Session) {
  var vm = this;

  // cache to save work-in-progress data and pre-fabricated templates
  var cache = AppCache('JournalVouchers');

  // bread crumb paths
  vm.paths = [{
    label : $translate.instant('VOUCHERS.SIMPLE.TITLE'),
    current: true
  }];

  // bind the startup method as a reset method
  vm.reset = startup;
  vm.submit = submit;

  // load the list of accounts
  Accounts.list()
  .then(function (accounts) {
    vm.accounts = accounts;
  });

  // load the available currencies
  Currencies.read()
  .then(function (currencies) {

    // format human readable labels
    currencies.forEach(function (currency) {
      currency.label = Currencies.format(currency.id);
    });

    // bind the currencies to the view
    vm.currencies = currencies;
  });

  /** run the module on startup and refresh */
  function startup() {

    // delete any state indicators (if they exist)
    delete vm.created;

    // this is the voucher form to be submitted
    vm.voucher = {};

    // set up default voucher values
    vm.voucher.date = new Date();
    vm.voucher.description =
      $translate.instant('VOUCHERS.SIMPLE.DESCRIPTION');

    /** @todo - these should be set on the server */
    vm.voucher.user_id = Session.user.id;
    vm.voucher.project_id = Session.project.id;

    // current timestamp to limit date
    vm.timestamp = new Date();
  }

  function submit(invalid) {

    // clear the old error if it exists
    delete vm.httpError;

    // stop submission if the form is invalid
    if (invalid) { return; }

    // turn the voucher into double-entry accounting
    return Vouchers.createSimple(vm.voucher)
    .then(function (res) {

      /** @todo - need a better way to handle state */
      vm.created = true;
    })

    // attach the error's translatable text to the view
    .catch(function (response) {
      if (response.data && response.data.code) {
        vm.httpError = response.data.code;
      }
    });
  }

  startup();
}
