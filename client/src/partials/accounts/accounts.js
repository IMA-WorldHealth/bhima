angular.module('bhima.controllers')
.controller('AccountsController', AccountsController);

AccountsController.$inject = [
  'AccountService', 'CostCenterService', 'ProfitCenterService', 'ReferenceService', 'AccountTypeService', 'util'
];

function AccountsController(Accounts, costCenterService, profitCenterService, referenceService, accountTypeService, util) { 
  var vm = this;

  
  
  var leafRowTemplate = `
      <div
        ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid"
        ui-grid-one-bind-id-grid="rowRenderIndex + '-' + col.uid + '-cell'"
        class="ui-grid-cell"
        ng-class="{ 'ui-grid-row-header-cell': col.isRowHeader, 'text-clear' : row.treeNode.children.length === 0 }"
        data-vals="{{col.isRowHeader}}"
        role="{{col.isRowHeader ? 'rowheader' : 'gridcell'}}"
        ui-grid-cell>
       </div>
  `;
  
  var indentCellTemplate = '<div class="ui-grid-cell-contents" ><span style="padding-left : {{row.treeLevel * 20}}px;"></span>{{grid.getCellValue(row, col)}}</div>';

  vm.gridOptions = {
    enableSorting : false,
    // enableGroupHeaderSelection : true
    showTreeExpandNoChildren : false,
    enableColumnMenus : false,
    showHeader : true,
    rowTemplate : leafRowTemplate,
    onRegisterApi : function (api) {
      api.grid.registerDataChangeCallback(function () {
        api.treeBase.expandAllRows();
      });
    }
  };
  
  var columns = [
    { field : 'id', displayName : '', cellClass : 'text-right', width : 70},
    { field : 'label', displayName : 'FORM.LABELS.ACCOUNT', cellTemplate : indentCellTemplate, headerCellFilter : 'translate' }
    // { field : 'parent', displayName : 'FORM.LABELS.PARENT', headerCellFilter : 'translate' },
    // { field : '$$treeLevel', displayName : '$$treeLevel', headerCellFilter : 'translate'}
  ];
  
  vm.gridOptions.columnDefs = columns;
  
  Accounts.read(null, {detailed : 1})
    .then(function (result) { 
      vm.gridOptions.data = Accounts.order(result); 
    });
}
