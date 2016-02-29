angular.module('bhima.controllers')
.controller('CashTransferModalController', CashTransferModalController);

CashTransferModalController.$inject = [
  '$uibModalInstance', 'SessionService', 'CurrencyService', 'cashBox'
];

/**
 * @module cash/modals/CashTransferModalController
 *
 * @description This controller is responsible transfering money between auxillary cash and a virement account
*/

function CashTransferModalController(ModalInstance, Session, currencyService, cashBox) {
  var vm = this; 

  /** Attaching service to the scope **/

  vm.cashBox = cashBox;
  vm.currencyService = currencyService; 

  /** check if the cashbox id is provided**/

  vm.cashBoxIdMissed = !cashBox.id;

  /**
  * @function submit
  * @param {boolean} invalid it is true if the form is valid
  * @description for submitting a dialog content
  **/

  function submit (invalid){
    console.log(invalid);
    if (invalid) { return; }
    console.log('on est la');
  }

  /**expose function to the scope**/ 

  vm.submit = submit;
}
