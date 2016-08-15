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
    { field : 'trans_id',
      displayName : 'TABLE.COLUMNS.TRANSACTION',
      headerCellFilter: 'translate',
      enableCellEdit: false,
      allowCellFocus: false
    },
    { field : 'account_number', displayName : 'TABLE.COLUMNS.ACCOUNT', headerCellFilter: 'translate' },
    { field : 'debit_equiv', displayName : 'TABLE.COLUMNS.DEBIT', headerCellFilter: 'translate', cellTemplate : '/partials/journal/templates/debit_equiv.cell.html' },
    { field : 'credit_equiv', displayName : 'TABLE.COLUMNS.CREDIT', headerCellFilter: 'translate', cellTemplate : '/partials/journal/templates/credit_equiv.cell.html' }
  ];
  var groupingDetail = {
    'trans_id' : groupByTransaction,
    'account_number' : groupByAccount,
    'initial' : 'trans_id'
  };

  var cacheKey = 'trial_balance'

  vm.enterprise = Session.enterprise;

  // var headerTemplate = 'partials/journal/templates/header-template.html';
  //
  // var superColDefs =  [
  //   {name : 'Compte', displayName : 'Compte'},
  //   { name: 'AVANT', displayName: 'AVANT' },
  //   { name: 'MOVEMENT', displayName: 'MOVEMENT'},
  //   { name: 'APRES', displayName: 'APRES'}
  // ];
  //
  // var columnDefs = [
  //   { name : 'account_number', displayName : 'account_number', superCol : 'ACCOUNT' },
  //   { name: 'debit_before', displayName: 'Debit_before', superCol: 'AVANT'},
  //   { name: 'credit_before', displayName: 'Credit_before', superCol: 'AVANT'},
  //   { name: 'debit_movement', displayName: 'Debit_movement', superCol: 'MOVEMENT'},
  //   { name: 'credit_before', displayName: 'Credit_movement', superCol: 'MOVEMENT'},
  //   { name: 'debit_after', displayName: 'Debit_after', superCol: 'APRES'},
  //   { name: 'credit_after', displayName: 'Credit_after', superCol: 'APRES'}
  // ];


  vm.gridOptions = {
    enableColumnMenus : false,
    treeRowHeaderAlwaysVisible: false,
    appScopeProvider : vm
  };
  journalPostingModalService.postingModalService(vm.gridOptions);

  vm.grouping  = new Grouping(vm.gridOptions, false, groupingDetail.initial);
  vm.columns = new Columns(vm.gridOptions, cacheKey);
  vm.gridOptions.data = journalPostingModalService.parseSelectedGridRecord(records);
  vm.gridOptions.columnDefs = columns;



  function groupByTransaction(currenteGroupingColumn, newGroupingColumn) {
    var obj = {};

    obj[newGroupingColumn] = true;
    vm.columns.setVisibleColumns(obj);
  }

  function  groupByAccount(currenteGroupingColumn, newGroupingColumn) {
    var obj = {};

    obj[currenteGroupingColumn] = false;
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
