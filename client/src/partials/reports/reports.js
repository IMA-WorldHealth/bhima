angular.module('bhima.controllers')
.controller('ReportsController', ReportsController);

ReportsController.$inject = ['$state'];

function ReportsController($state) {
  var vm = this;

  var keyTarget = $state.params.key;

  console.log(keyTarget);

  vm.gridOptions = {
    fastWatch : true,
    flatEntityAccess : true
  };

  vm.gridOptions.columnDefs = [
    { field : 'label', displayName : 'FORM.LABELS.LABELS', headerCellFilter : 'translate' }
  ];
}
