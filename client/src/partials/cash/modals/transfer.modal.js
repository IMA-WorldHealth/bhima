angular.module('bhima.controllers')
  .controller('CashTransferModalController', CashTransferModalController);

CashTransferModalController.$inject = [
  'CurrencyService', 'VoucherService', 'CashboxService', 'AccountService', 'SessionService',
  'CashService', '$state', 'NotifyService', 'ReceiptModal', 'bhConstants', 'VoucherForm'
];

/**
 * @module CashTransferModalController
 *
 * @description
 * This controller is responsible transferring money between a cashbox and a transfer account.
 */
function CashTransferModalController(Currencies, Vouchers, Cashboxes, Accounts, Session, Cash, $state, Notify, Receipts, bhConstants, VoucherForm) {
  var vm = this;

  vm.voucher = new VoucherForm('CashTransferForm');

  var TRANSFER_TYPE_ID = bhConstants.transactionType.TRANSFER;

  vm.loadAccountDetails = loadAccountDetails;
  vm.submit = submit;

  // submit and close the modal
  function submit(form) {
    if (form.$invalid) { return; }

    var record = prepareVoucherRecord();

    // validate
    var validation = vm.voucher.validate();
    if (!validation) { return; }

    return Vouchers.create(record)
      .then(function (response) {
        Notify.success('CASH.TRANSFER.SUCCESS');
        return Receipts.voucher(response.uuid, true);
      })
      .then(function () {
        return $state.go('^.window', { id : $state.params.id });
      })
      .catch(Notify.handleError);
  }

  function prepareVoucherRecord() {

    // extract the voucher from the VoucherForm
    var record = vm.voucher.details;
    record.items = vm.voucher.store.data;

    // configure the debits/credits appropriately

    var debit = record.items[0];
    debit.configure({ debit : vm.amount, account_id : vm.transferAccount.id });

    var credit = record.items[1];
    credit.configure({ credit : vm.amount, account_id : vm.cashAccount.id });

    // format voucher description as needed
    vm.voucher.description('CASH.TRANSFER.DESCRIPTION', {
      amount : vm.amount,
      fromLabel : vm.cashAccount.label,
      toLabel : vm.transferAccount.label,
      userName : Session.user.display_name
    });

    return record;
  }

  // this object retains a mapping of the currency ids to their respective accounts.
  var cashCurrencyMap = {};

  // this function maps the accounts to their respective currencies.
  // { currency_id :  { currency_id, account_id, transfer_account_id } }
  function mapCurrenciesToAccounts(currencies) {
    return currencies.reduce(function (map, currency) {
      map[currency.currency_id] = currency;
      return map;
    }, {});
  }

  // fired on state startup
  function startup() {

    // set the transaction type id
    vm.voucher.details.type_id = TRANSFER_TYPE_ID;

    // load needed modules
    Currencies.read()
      .then(function (currencies) {
        vm.currencies = currencies;
        return Cashboxes.read($state.params.id);
      })
      .then(function (cashbox) {
        vm.cashbox = cashbox;
        vm.disabledCurrencyIds = Cash.calculateDisabledIds(cashbox, vm.currencies);

        // load the accounts up for the voucher currency
        loadAccountDetails(vm.voucher.details.currency_id);
      })
      .catch(Notify.handleError);
  }

  function loadAccountDetails(selectedCurrencyId) {

    // create the cashCurrencyMap
    cashCurrencyMap = mapCurrenciesToAccounts(vm.cashbox.currencies);

    // pull the accounts from the cashCurrencyMap
    var accounts = cashCurrencyMap[selectedCurrencyId];

    // look up the transfer account
    Accounts.read(accounts.transfer_account_id)
      .then(function (account) {
        account.hrlabel = Accounts.label(account);
        vm.transferAccount = account;
      })
      .catch(Notify.handleError);

    // look up the cash account
    Accounts.read(accounts.account_id)
      .then(function (account) {
        account.hrlabel = Accounts.label(account);
        vm.cashAccount = account;
      })
      .catch(Notify.handleError);
  }

  startup();
}
