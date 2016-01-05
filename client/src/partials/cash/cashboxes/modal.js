angular.module('bhima.controllers')
.controller('CashboxCurrencyModalController', CashboxCurrencyModalController);

CashboxCurrencyModalController.$inject = [
  '$uibModalInstance', 'AccountService', 'CashboxService',
  'currency', 'cashbox', 'data'
];

/**
* CashboxCurrencyModalController
*
* This modal is responsible for creating the currency infrastructure behind
* cashboxes.  Each cashbox must a currencied account defined for each currency
* supported by the application.
*/
function CashboxCurrencyModalController($instance, Accounts, Boxes, currency, cashbox, data) {
  var vm = this;

  // determine whether we will send a POST or a PUT request to the server
  var method = (cashbox.currencies.indexOf(currency.id) > -1) ?
    'update' :
    'create';

  // bind data
  vm.currency = currency;
  vm.cashbox = cashbox;
  vm.data = data;
  vm.data.currency_id = currency.id;

  // bind methods to the view-model
  vm.dismiss = $instance.dismiss;
  vm.submit = submit;

  /* ------------------------------------------------------------------------ */

  // generic error handling
  function handler(error) {
    vm.error = true;
    console.log(error);
  }

  // startup script for the controller
  function startup() {

    // load accounts and properly formats their labels
    Accounts.list()
      .then(function (accounts) {

        // compute account labels once and use for all time
        // @todo should this be done in the account service?
        accounts.forEach(function (account) {
          account.label = account.account_number + ' ' + account.account_txt;
        });

        vm.accounts = accounts;
      })
      .catch(handler);
  }

  // return data to the
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
    promise
      .then($instance.close)
      .catch(handler);
  }

  // startup the controller
  startup();
}
