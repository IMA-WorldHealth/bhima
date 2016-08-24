angular.module('bhima.controllers')
  .controller('CashTransferModalController', CashTransferModalController);

CashTransferModalController.$inject = [
  'CurrencyService', 'VoucherService', 'CashboxService', 'AccountService',
  'CashService', '$state', 'NotifyService', 'SessionService'
];

/**
 * @module cash/modals/CashTransferModalController
 *
 * @description
 * This controller is responsible transferring money between auxiliary cash and a transfer account
*/

function CashTransferModalController(Currencies, Vouchers, Cashboxes, Accounts, Cash, $state, Notify, Session) {
  var vm = this;
  var id = $state.params.id;

  vm.loadAccountDetails = loadAccountDetails;
  vm.submit = submit;

  // submit and close the modal
  function submit(form) {
    if (form.$invalid) { return; }

    var cashAccountCurrency;

    // TODO - clean this code up.
    vm.cashbox.currencies.forEach(function (row) {
      if (row.currency_id === vm.record.currency_id) {
        cashAccountCurrency = row;
      }
    });

    var record = Cash.getTransferRecord(cashAccountCurrency, vm.record.amount, vm.record.currency_id);

    return Vouchers.create(record)
      .then(function (response) {
        Notify.success('CASH.TRANSFER.SUCCESS');
        return $state.go('^.window', { id : id });
      })
      .catch(Notify.handleError);
  }

  // fired on state startup
  function startup() {

    // the blank transfer record
    vm.record = {
      currency_id : Session.enterprise.currency_id
    };

    // load needed modules
    Currencies.read()
      .then(function (currencies) {
        vm.currencies = currencies;
        return Cashboxes.read(id);
      })
      .then(function (cashbox) {
        vm.cashbox = cashbox;
        vm.disabledCurrencyIds = Cash.calculateDisabledIds(cashbox, vm.currencies);

        // load the accounts up
        loadAccountDetails();
      })
      .catch(Notify.handleError);
  }

  function loadAccountDetails() {
    var transferAccountId;
    var cashAccountId;

    vm.cashbox.currencies.forEach(function (row) {
      if (row.currency_id === vm.record.currency_id) {
        transferAccountId = row.transfer_account_id;
        cashAccountId = row.account_id;
      }
    });

    Accounts.read(transferAccountId)
      .then(function (account) {
        vm.cashAccount = account;
      })
      .catch(Notify.handleError);

    Accounts.read(cashAccountId)
      .then(function (account) {
        vm.transferAccount = account;
      })
      .catch(Notify.handleError);
  }

  startup();
}
