angular.module('bhima.controllers')
.controller('SimpleJournalVoucherController', SimpleJournalVoucherController);

SimpleJournalVoucherController.$inject = [
  'AppCache', 'VoucherService', 'AccountService', 'SessionService', 'util',
  'NotifyService', 'ModalService'
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
function SimpleJournalVoucherController(AppCache, Vouchers, Accounts, Session, util, Notify, Modal) {
  var vm = this;

  // cache to save work-in-progress data and pre-fabricated templates
  var cache = AppCache('JournalVouchers');

  // global variables
  vm.maxLength = util.maxTextLength;
  vm.paths = [
    { label : 'TREE.FINANCE' },
    { label : 'VOUCHERS.SIMPLE.TITLE' }
  ];

  // expose methods to the view
  vm.submit = submit;
  vm.buildDescription = buildDescription;

  /* run the module on startup and refresh */
  function startup() {

    // current timestamp to limit date
    vm.timestamp = new Date();

    // set up default voucher values
    vm.voucher = {};
    vm.voucher.date = new Date();
    vm.voucher.currency_id = Session.enterprise.currency_id;

    // transaction type
    Vouchers.transactionType()
    .then(function (list) {
      groupType(list.data);
    })
    .catch(Notify.handleError);

    // load the list of accounts
    Accounts.read()
    .then(function (accounts) {
      vm.accounts = accounts;
    })
    .catch(Notify.handleError);

  }

  function submit(form) {

    // stop submission if the form is invalid
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.RECORD_ERROR');
      return;
    }

    // description prefix
    vm.voucher.description =  String(vm.descriptionPrefix).concat('/', vm.voucher.description);

    // transfer type
    vm.voucher.type_id = vm.selectedType ? JSON.parse(vm.selectedType).id : null;

    // submit the voucher
    return Vouchers.createSimple(vm.voucher)
    .then(function (res) {

      // Generate the document
      return Modal.openReports({ url: '/vouchers/receipts/' + res.uuid, renderer: 'pdf' });
    })
    .then(function () {

      // setup the voucher object to init state
      form.$setPristine();
      vm.type = undefined;
      vm.descriptionPrefix = undefined;
      vm.selectedType = undefined;

      // rerun the startup script
      startup();
    })
    .catch(Notify.handleError);
  }

  function groupType(array) {
    vm.incomes = array.filter(function (item) {
      return item.type === 'income';
    });
    vm.expenses = array.filter(function (item) {
      return item.type === 'expense';
    });
  }

  function buildDescription() {
    if (!vm.selectedType) { return; }

    var current = new Date();
    var selected = JSON.parse(vm.selectedType);
    vm.type = selected.type;

    vm.descriptionPrefix = String(Session.project.abbr)
      .concat('/', selected.prefix, '/')
      .concat(current.toDateString());
  }

  startup();
}
