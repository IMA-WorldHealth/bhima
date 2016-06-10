angular.module('bhima.controllers')
.controller('AccountsController', AccountsController);

AccountsController.$inject = [
  'AccountService', 'CostCenterService', 'ProfitCenterService', 'ReferenceService', 'AccountTypeService', 'util'
];

function AccountsController(Accounts, costCenterService, profitCenterService, referenceService, accountTypeService, util) { 
  var vm = this;

  vm.gridOptions = {
    enableSorting : false,
    showTreeExpandNoChildren : true
  };

  var columns = [
    { field : 'id', displayName : 'FORM.LABELS.ACCOUNT_NUMBER', headerCellFilter : 'translate' },
    { field : 'label', displayName : 'FORM.LABELS.LABEL', headerCellFilter : 'translate' }
  ]
  
  vm.gridOptions.columnDefs = columns;
  
  Accounts.read(null, {detailed : 1})
    .then(function (result) { 
      vm.gridOptions.data = result;
      console.log(result);

      var treeStructure = Accounts.getChildren(result, 0);
      var flat = Accounts.flatten(treeStructure);
      
      console.log(flat);
    });
}
