angular.module('bhima.controllers')
.controller('AccountsController', AccountsController);

AccountsController.$inject = [
  'AccountService', 'CostCenterService', 'ProfitCenterService', 'ReferenceService', 'AccountTypeService',
  'util', 'NotifyService'
];

/**
 * Note : all flattening and depth display depends on account order, if a reorder or filter is performed this 
 * may need to be recalculated
 */
function AccountsController(Accounts, Notify) { 

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
  
  var indentCellTemplate = '<div ng-class="{\'text-action\' : row.treeNode.children.length > 0}" class="ui-grid-cell-contents" ng-click="grid.api.treeBase.toggleRowTreeState(row)"><span style="padding-left : {{row.treeLevel * 20}}px;"></span><i ng-if="row.entity.locked" class="fa fa-lock"></i> {{grid.getCellValue(row, col)}}</div>';
  
  vm.gridOptions = {
    appScopeProvider : vm,
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
    })
    .catch(Notify.handleError);
}
