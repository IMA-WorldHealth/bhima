angular.module('bhima.controllers')
  .controller('CashboxCurrencyModalController', CashboxCurrencyModalController);

CashboxCurrencyModalController.$inject = [
  '$uibModalInstance', 'AccountService', 'CashboxService', 'currency', 'cashbox', 'data', 'NotifyService',
];

/**
 * Cashbox Currency Modal Controller
 *
 * This modal is responsible for creating the currency infrastructure behind
 * cashboxes.  Each cashbox must have a currencied account defined for each currency
 * supported by the application.
 */
function CashboxCurrencyModalController(ModalInstance, Accounts, Boxes, currency, cashbox, data, Notify) {
  var vm = this;

  // if a currency matches, we are updating.  Otherwise, we are creating.
  var currencyIds = cashbox.currencies.map(function (row) {
    return row.currency_id;
  });

  // determine whether we will send a POST or a PUT request to the server
  var method = (currencyIds.indexOf(currency.id) > -1) ?
    'update' :
    'create';

  // bind data
  vm.currency = currency;
  vm.cashbox = cashbox;
  vm.data = data;
  vm.data.currency_id = currency.id;
  vm.onSelectCashAccount = onSelectCashAccount;
  vm.onSelectTransferAccount = onSelectTransferAccount;

  // bind methods to the view-model
  vm.dismiss = ModalInstance.dismiss;
  vm.submit = submit;

  // callback for currency account
  function onSelectCashAccount(account) {
    vm.data.account_id = account.id;
  }

  // callback for transfer account
  function onSelectTransferAccount(account) {
    vm.data.transfer_account_id = account.id;
  }

  // submit to the server
  function submit(form) {

    // if the form has errors, exit immediately
    if (form.$invalid) { return; }

    // if the form was never touched, just dismiss it.
    if (form.$pristine) { vm.dismiss(); }

    // send either a create or an update request to the server
    var promise = (method === 'create') ?
      Boxes.currencies.create(vm.cashbox.id, vm.data) :
      Boxes.currencies.update(vm.cashbox.id, vm.data);

    // upon successful completion, close the modal or error out
    return promise
      .then(function () { ModalInstance.close(); })
      .catch(Notify.handleError);
  }
}
