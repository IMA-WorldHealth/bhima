angular.module('bhima.controllers')
.controller('ColumnsConfigModalController', ColumnsConfigModalController);

ColumnsConfigModalController.$inject = [ '$uibModalInstance', 'columnList', 'defaultColumns'];

/**
 * @module cash/modals/CashTransferModalController
 *
 * @description This controller is responsible transfering money between auxillary cash and a virement account
*/

function ColumnsConfigModalController(ModalInstance, columnList, defaultColumns) {
  var vm = this; 

  vm.columns = columnList;
  vm.defaultColumns = defaultColumns;
  
  /**
  * @function submit
  * @description for submitting a dialog content
  **/
  function submit (){
    ModalInstance.close({ columns : vm.columns }); 
  }

  function reset (){
    ModalInstance.close({ columns : vm.defaultColumns });
  }  

  /**expose function to the scope**/ 
  vm.submit = submit;
  vm.reset = reset;
}
