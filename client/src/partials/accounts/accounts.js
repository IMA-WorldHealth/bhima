/** @todo Cache accounts on download and expose store to add new and updated accounts */
/** @todo Accounts should be sorted whilst strictly in the tree structure by account ID */
angular.module('bhima.controllers')
.controller('AccountsController', AccountsController);

AccountsController.$inject = [
  '$state', 'AccountStoreService', 'AccountService', 'NotifyService'
];

/**
 * Note : all flattening and depth display depends on account order, if a reorder or filter is performed this 
 * may need to be recalculated
 */
function AccountsController($state, AccountStore, Accounts, Notify) { 
  
  console.log('parent accounts controller');
  var vm = this;
  vm.targetId = $state.params.id; 
  console.log('$stateParams', $state.params.id);
  
  /** @todo get this from constant definition */
  vm.TITLE_ACCOUNT = 4;
  
  var leafRowTemplate = `
      <div
        ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid"
        ui-grid-one-bind-id-grid="rowRenderIndex + '-' + col.uid + '-cell'"
        class="ui-grid-cell"
        ng-class="{ 'ui-grid-row-header-cell': col.isRowHeader, 'text-clear' : row.entity.type_id !== grid.appScope.TITLE_ACCOUNT }"
        data-vals="{{col.isRowHeader}}"
        role="{{col.isRowHeader ? 'rowheader' : 'gridcell'}}"
        ui-grid-cell>
       </div>
  `;
  
  var indentCellTemplate = '<div class="ui-grid-cell-contents"><span ng-click="grid.api.treeBase.toggleRowTreeState(row)" ng-class="{\'text-action\' : row.treeNode.children.length > 0}"> <span style="padding-left : {{row.treeLevel * 20}}px;"></span><i ng-if="row.entity.locked" class="fa fa-lock"></i> {{grid.getCellValue(row, col)}}</span> <a ng-if="row.entity.type_id === grid.appScope.TITLE_ACCOUNT" ui-sref="accounts.create({ parentId : row.entity.id })"> <i class="fa fa-plus-square-o"></i> Add child account</a></div>';
  var actionsCellTemplate = '<div class="ui-grid-cell-contents"><a ui-sref="accounts.edit({id:row.entity.id})"><i class="fa fa-edit"></i> Edit {{row.entity.number}}</a></div>'; 
 
  vm.gridOptions = {
    appScopeProvider : vm,
    enableSorting : false,
    // enableGroupHeaderSelection : true
    showTreeExpandNoChildren : false,
    enableColumnMenus : false,
    // showHeader : true,
    rowTemplate : leafRowTemplate,
    onRegisterApi : function (api) {
      api.grid.registerDataChangeCallback(function () {
        api.treeBase.expandAllRows();
      });
    }
  };
  
  var columns = [
    { field : 'number', displayName : '', cellClass : 'text-right', width : 70},
    { field : 'label', displayName : 'FORM.LABELS.ACCOUNT', cellTemplate : indentCellTemplate, headerCellFilter : 'translate' },
    { name : 'actions', displayName : '', cellTemplate : actionsCellTemplate, headerCellFilter : 'translate', width : 140 }
    // { field : 'parent', displayName : 'FORM.LABELS.PARENT', headerCellFilter : 'translate' },
    // { field : '$$treeLevel', displayName : '$$treeLevel', headerCellFilter : 'translate'}
  ];
  
  vm.gridOptions.columnDefs = columns;
  
  AccountStore.readCache()
    .then(function (result) { 
      vm.gridOptions.data = Accounts.order(result);
    })
    .catch(Notify.handleError);
}
