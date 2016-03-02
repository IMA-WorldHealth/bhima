angular.module('bhima.controllers')
.controller('CashTransferModalController', CashTransferModalController);

CashTransferModalController.$inject = [
  '$uibModalInstance', '$q', 'SessionService', 'CurrencyService', 'VoucherService', 'CashboxService', 'cashBox', 'uuid'
];

/**
 * @module cash/modals/CashTransferModalController
 *
 * @description This controller is responsible transfering money between auxillary cash and a virement account
*/

function CashTransferModalController(ModalInstance, $q, sessionService, currencyService, voucherService, cashBoxService, cashBox, uuid) {
  var vm = this; 

  /** Attaching service to the scope **/
  vm.cashBox = cashBox;
  vm.currencyService = currencyService; 
  vm.cashBoxService = cashBoxService;

  /** check if the cashbox id is provided**/
  vm.cashBoxIdMissed = !cashBox.id;

  /**
  * @function submit
  * @param {boolean} invalid it is true if the form is valid
  * @description for submitting a dialog content
  **/
  function submit (invalid){
    if (invalid) { return; }

    cashBoxService.currencies.read(vm.cashBox.id, vm.currency_id)
    .then(function (cashAccountCurrency){
      vm.cashAccountCurrency = cashAccountCurrency;      
      var voucher = processVoucher();
      var voucher_item = processVoucherItem(voucher.uuid);
      var record = { voucher : voucher, voucher_item : voucher_item };
      return $q.when(record);
    })
    .then(function (record){
      return voucherService.create(record);        
    })
    .then(function (res){
      ModalInstance.close(res);
    });          
  }

  function cancel (){
    ModalInstance.dismiss();
  }

  /**
  * This methode is responsible to generate a description for the voucher operation
  * @private
  **/
  function generateDescription (){
    return ['Transfer voucher', new Date().toISOString().slice(0, 10)].join('/');
  }

  /**
  * This methode is responsible to create a voucher object and it back
  * @private
  **/
  function processVoucher (){
    var voucher = {
      uuid : uuid(),
      project_id : sessionService.project.id,
      currency_id : vm.currency_id,
      amount : vm.amount,
      description : generateDescription(),
      user_id : sessionService.user.id
    }

    return voucher;
  }

  /**
  * This methode is responsible to create a array of voucher_item based on voucher_uuid and send it back
  * @private
  **/
  function processVoucherItem (voucher_uuid){

    var cashVoucherLine = [
      uuid (),
      vm.cashAccountCurrency.account_id,
      0,
      vm.amount,
      voucher_uuid
    ];

    var transferVoucherLine = [
      uuid (),
      vm.cashAccountCurrency.virement_account_id,
      vm.amount,
      0,
      voucher_uuid
    ];

    return [cashVoucherLine, transferVoucherLine];
  }

  /**expose function to the scope**/ 
  vm.submit = submit;
  vm.cancel = cancel;
}
