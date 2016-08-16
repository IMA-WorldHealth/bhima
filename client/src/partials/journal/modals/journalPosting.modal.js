angular.module('bhima.controllers')
  .controller('JournalPosterModalController', JournalPosterModalController);

JournalPosterModalController.$inject = [ 
  '$uibModalInstance', 'SessionService', 'JournalPostingModalService',
  'GridGroupingService', 'Records', 'GridColumnService'
];

/**
 * @module journal/modals/JournalPoster.modal
 *
 * @description
 * This controller provides a tool to do trial balance
 */
function JournalPosterModalController(ModalInstance, Session, journalPostingModalService, Grouping,  records, Columns) {
  var vm = this;

  var columns = [
    { field : 'trans_id', displayName : 'TABLE.COLUMNS.TRANSACTION', headerCellFilter: 'translate', enableCellEdit: false, allowCellFocus: false},
    { field : 'account_number', displayName : 'TABLE.COLUMNS.ACCOUNT', headerCellFilter: 'translate' },
    { field : 'balance', displayName : 'TABLE.COLUMNS.BEFORE', headerCellFilter : 'translate', enableCellEdit : false, allowCellFocus : false, visible : false},
    { field : 'debit_equiv', displayName : 'TABLE.COLUMNS.DEBIT', headerCellFilter: 'translate', cellTemplate : '/partials/journal/templates/debit_equiv.cell.html' },
    { field : 'credit_equiv', displayName : 'TABLE.COLUMNS.CREDIT', headerCellFilter: 'translate', cellTemplate : '/partials/journal/templates/credit_equiv.cell.html'},
    { field : 'final_balance', displayName : 'TABLE.COLUMNS.AFTER', headerCellFilter : 'translate', visible : false}
  ];

  var groupingDetail = {
    'trans_id' : groupByTransaction,
    'account_number' : groupByAccount,
    'initial' : 'trans_id'
  };

  var cacheKey = 'trial_balance';

  vm.enterprise = Session.enterprise;
  vm.previousData = [];
  vm.dataByTrans = journalPostingModalService.parseSelectedGridRecord(records);
  vm.dataByAccount = journalPostingModalService.getDataByAccount(vm.dataByTrans);
  vm.gridOptions = {
    enableColumnMenus : false,
    treeRowHeaderAlwaysVisible: false,
    appScopeProvider : vm
  };

  journalPostingModalService.postingModalService(vm.gridOptions);

  vm.gridOptions.columnDefs = columns;
  vm.gridOptions.data = vm.dataByTrans;
  vm.grouping  = new Grouping(vm.gridOptions, false, groupingDetail.initial);
  vm.columns = new Columns(vm.gridOptions, cacheKey);

  function groupByTransaction(currenteGroupingColumn, newGroupingColumn) {
    var obj = {};

    obj[newGroupingColumn] = true;
    obj.balance = false;
    obj.final_balance = false;

    vm.gridOptions.data = vm.dataByTrans;
    vm.columns.setVisibleColumns(obj);
  }

  function  groupByAccount(currenteGroupingColumn, newGroupingColumn) {
    var obj = {};

    obj[currenteGroupingColumn] = false;
    obj.balance = true;
    obj.final_balance = true;

    vm.gridOptions.data = vm.dataByAccount;
    vm.columns.setVisibleColumns(obj);
  }

  /**
   * @function submit
   * @description for submitting a dialog content
   */
  function submit() {
    ModalInstance.close();
  }

  // dismiss the modal, canceling column updates
  function cancel() {
    ModalInstance.dismiss();
  }

  /**
   *  @function switchGroup
   * @description
   * This method can change the grouping from by transaction to by account vice versa
   **/
  function switchGroup (){
    
    var currentGroupingColumn = journalPostingModalService.getCurrentGroupingColumn();
    var newGroupingColumn = journalPostingModalService.switchGroup(currentGroupingColumn);
    groupingDetail[newGroupingColumn](currentGroupingColumn, newGroupingColumn);
    vm.grouping.changeGrouping(newGroupingColumn);
  }

  vm.submit = submit;
  vm.cancel = cancel;
  vm.switchGroup = switchGroup;
}
