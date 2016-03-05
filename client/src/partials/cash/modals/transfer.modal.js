angular.module('bhima.controllers')
.controller('CashTransferModalController', CashTransferModalController);

CashTransferModalController.$inject = [
  '$uibModalInstance', 'CurrencyService', 'VoucherService',
   'CashboxService', 'AccountService', 'CashService', 'cashBox'
];

/**
 * @module cash/modals/CashTransferModalController
 *
 * @description This controller is responsible transfering money between auxillary cash and a virement account
*/

function CashTransferModalController(ModalInstance, currencyService, voucherService, cashBoxService, accountService, cashService, cashBox) {
  var vm = this; 

  /** Attaching service to the scope **/
  vm.cashBox = cashBox;
  vm.currencyService = currencyService; 
  vm.cashBoxService = cashBoxService;

  /** init success to false**/
  vm.success = false;

  /**
  * @function submit
  * @param {boolean} invalid it is true if the form is valid
  * @description for submitting a dialog content
  **/
  function submit (invalid){
    if (invalid) { return; }
    var record = cashService.getTransferRecord(vm.cashAccountCurrency, vm.amount, vm.currency_id);
    voucherService.create(record)      
    .then(function (res){
      vm.success = true;
    });
  }

  function cancel (){
    ModalInstance.dismiss();
  }

  function handleCurrencyChange () {
    cashBoxService.currencies.read(vm.cashBox.id, vm.currency_id)
    .then(function (cashAccountCurrency){
      vm.cashAccountCurrency = cashAccountCurrency; 
      return  accountService.getBalance(vm.cashAccountCurrency.account_id, { params : { journal : 1 }});
    })
    .then(function (balance){
      vm.cashAccountBalance = balance;
    });
  }

  /**expose function to the scope**/ 
  vm.submit = submit;
  vm.cancel = cancel;
  vm.handleCurrencyChange = handleCurrencyChange;
}
