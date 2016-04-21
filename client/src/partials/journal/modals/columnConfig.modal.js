angular.module('bhima.controllers')
.controller('ColumnsConfigModalController', ColumnsConfigModalController);

ColumnsConfigModalController.$inject = [ '$uibModalInstance', 'visibilityList', 'defaultVisibility'];

/**
 * @module journal/modals/columnConfig.modal
 *
 * @description This controller is responsible for showing or Hiding columns
*/
function ColumnsConfigModalController(ModalInstance, visibilityList, defaultVisibility) {
  var vm = this; 

  vm.visibilityList = visibilityList;
  vm.defaultvisibilityList = defaultVisibility;

  //the middle of the list to print element on two columns
  vm.middle = Math.round( Object.keys(visibilityList).length / 2 ); 
  
  /**
  * @function submit
  * @description for submitting a dialog content
  **/
  function submit (){
    ModalInstance.close({ configList : vm.visibilityList }); 
  }

  //reset the column visibilty to their default configuration
  function reset (){ 
    vm.visibilityList = vm.defaultvisibilityList;
  }  

  /**expose function to the scope**/ 
  vm.submit = submit;
  vm.reset = reset;
}
