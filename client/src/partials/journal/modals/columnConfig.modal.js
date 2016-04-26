angular.module('bhima.controllers')
.controller('ColumnsConfigModalController', ColumnsConfigModalController);

ColumnsConfigModalController.$inject = [ '$uibModalInstance', 'columns', 'defaultVisibility', 'JournalColumnUtility'];

/**
 * @module journal/modals/columnConfig.modal
 *
 * @description This controller is responsible for showing or Hiding columns
*/
function ColumnsConfigModalController(ModalInstance, columns, defaultVisibility, Util) {
  var vm = this; 

  vm.columns = columns;
  vm.defaultvisibilityList = defaultVisibility;

  //the middle of the list to print element on two columns
  vm.middle = Math.round( Object.keys(columns).length / 2 ); 
  
  /**
  * @function submit
  * @description for submitting a dialog content
  **/
  function submit (){
    ModalInstance.close({ configList : vm.columns }); 
  }

  //reset the column visibilty to their default configuration
  function reset (){ 
    vm.columns = Util.toggleVisibility(vm.columns, vm.defaultvisibilityList);
  }  

  /**expose function to the scope**/ 
  vm.submit = submit;
  vm.reset = reset;
}
