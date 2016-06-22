/** @todo Cache accounts on download and expose store to add new and updated accounts */
/** @todo Accounts should be sorted whilst strictly in the tree structure by account ID */
/** @todo Investigate if there is a better way of passing data back to the parent other than $scope */
/** @todo if a record cannot be found it still shows the form */
/** @todo there are performance issues on this page - this should be because of  row/ cell templates, informally investigate */
/** @todo known limitation - as only the current account is updated, a reordering of numbers is not performed on update */
/** @todo you should not be able to change the type of a title account with children */
/** @todo you cannot update the number or type of an account */
/** @todo business logic for deleting an account */

/** @todo move underlying account data into AccountList service that can be tested */

/** @todo accounts expand even if the underlying data is not reset */

/**
 * Business rules implemented
 * 1. you cannot update an account number 
 * 2. you cannot update an account type
 * 3. you can only delete an ccount if it is unused
 */
angular.module('bhima.controllers')
.controller('AccountsController', AccountsController);

AccountsController.$inject = [
  '$rootScope', '$state', 'AccountGridService', 'AccountStoreService', 'AccountService', 'NotifyService'
];

/**
 * Note : all flattening and depth display depends on account order, if a reorder or filter is performed this 
 * may need to be recalculated
 */
function AccountsController($rootScope, $state, AccountGrid, AccountStore, Accounts, Notify) { 
  
  var vm = this;
  var initialRequestCache; 
  
  vm.targetId = $state.params.id; 
  
  vm.Accounts = new AccountGrid();
  
  vm.Accounts.settup()
    .then(bindGridData)
    .catch(Notify.handleError);
  
  function bindGridData() { 
    vm.gridOptions.data = vm.Accounts.data;
  }
  
  /** @todo get this from constant definition */
  vm.TITLE_ACCOUNT = 4;
  vm.ROOT_ACCOUNT = 0;
  
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
  
  var initialDataSet = true;
  
  vm.gridOptions = {
    appScopeProvider : vm,
    enableSorting : false,
    // enableGroupHeaderSelection : true
    showTreeExpandNoChildren : false,
    enableColumnMenus : false,
    // showHeader : true,
    rowTemplate : leafRowTemplate,
    onRegisterApi : function (api) {
      
      api.grid.registerDataChangeCallback(function (grid) {
        if (initialDataSet && grid.options.data.length) {
          api.treeBase.expandAllRows();
          initialDataSet = false;
        }
      });
    }
  };
  
  var columns = [
    { field : 'number', displayName : '', cellClass : 'text-right', width : 70},
    { field : 'label', displayName : 'FORM.LABELS.ACCOUNT', cellTemplate : indentCellTemplate, headerCellFilter : 'translate' },
    { name : 'actions', displayName : '', cellTemplate : actionsCellTemplate, headerCellFilter : 'translate', width : 140 }
  ];
  
  vm.gridOptions.columnDefs = columns;
  
  // insert flat 
  // build order tree 
  // insert live - this maintains the expand/ collapse state of the current tree
  
  // 1. insert account into correct order in the data - accounts are ordered by number implicitly when returned from the server
  // 2. build an account tree of new data set with the new account - this will ensure the hierachy is respected
  // 3. set the grids data to the newly generated flat list

  // assume the only entities that can be updated here are account text (name - label) and parent
  function updateViewEdit(event, account) { 
    AccountStore.store().then(function (result) { 
      var t = result.get(account.id);
    
      // update grouping - only if this has changed, support this? potentially just set data and refresh the view
      // forces grid set data refresh
      if (t.parent !== account.parent) { 
        
  
        initialDataSet = true;
        /** @fixme change this to using a store */
        initialRequestCache.some(function (item, index) {
          if (item.id === account.id) { 
            angular.extend(item, account);
            delete item.$$treeLevel;
            delete item.children;
            return true;
          } 
          return false;
        });
        vm.gridOptions.data = Accounts.order(angular.copy(initialRequestCache));

        console.log('parent changed - refreshing view');
      } else {
        console.log('parent not changed, simply update attributes');
      }

      // update stored attributes 
      angular.extend(t, account);
    });
  }
  
  // because the modal is instantiated on onEnter in the ui-router configuration the 
  // $parent $scope for the modal is $rootScope, it is impossible to inject the $scope of the 
  // parent state into the onEnter callback. for this reason $rootScope is used for now
  
  // this is implemented because it this is a very heavy page to force an entire reload
  
  // AccountGrid.insertAccount
  // AccountGrid.updateAccount
  $rootScope.$on('ACCOUNT_CREATED', vm.Accounts.updateViewInsert.bind(vm.Accounts));
  $rootScope.$on('ACCOUNT_UPDATED', updateViewEdit);
}
