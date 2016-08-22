angular.module('bhima.controllers')
  .controller('JournalPosterModalController', JournalPosterModalController);

JournalPosterModalController.$inject = [ 
  '$uibModalInstance', 'SessionService', 'JournalPostingModalService',
  'GridGroupingService', 'Records', 'GridColumnService', 'NotifyService'
];

/**
 * @module journal/modals/JournalPoster.modal
 *
 * @description
 * This controller provides a tool to do trial balance
 */
function JournalPosterModalController(ModalInstance, Session, journalPostingModalService, Grouping,  records, Columns, Notify) {
  var vm = this, cacheKey = 'trial_balance', feedBack = null;
  var columns = [
    { field : 'trans_id', displayName : 'TABLE.COLUMNS.TRANSACTION', headerCellFilter: 'translate', enableCellEdit: false, allowCellFocus: false},
    { field : 'account_number', displayName : 'TABLE.COLUMNS.ACCOUNT', headerCellFilter: 'translate'},
    { field : 'balance_before', displayName : 'TABLE.COLUMNS.BEFORE', headerCellFilter : 'translate', enableCellEdit : false, allowCellFocus : false, visible : false},
    { field : 'debit_equiv', displayName : 'TABLE.COLUMNS.DEBIT', headerCellFilter: 'translate', cellTemplate : '/partials/journal/templates/debit_equiv.cell.html' },
    { field : 'credit_equiv', displayName : 'TABLE.COLUMNS.CREDIT', headerCellFilter: 'translate', cellTemplate : '/partials/journal/templates/credit_equiv.cell.html'},
    { field : 'balance_final', displayName : 'TABLE.COLUMNS.AFTER', headerCellFilter : 'translate', visible : false}
  ];

  vm.enterprise = Session.enterprise;
  vm.errors = null; //while null the grid will not be shown
  vm.cssClass = null;
  vm.feedBack = null;
  vm.groupingDetail = { 'trans_id' : groupByTransaction, 'account_number' : groupByAccount, 'initial' : 'trans_id', 'selected' : 'trans_id', key : 'FORM.BUTTONS.GROUP_BY_TRANSACTION'};
  vm.dataByTrans = journalPostingModalService.parseSelectedGridRecord(records); //parse grid row to printable format


  function groupByTransaction(currenteGroupingColumn, newGroupingColumn) {
    vm.columns.setVisibleColumns({trans_id : true, balance_before : false, balance_final : false});
    vm.gridOptions.data = vm.dataByTrans;
    vm.groupingDetail.selected = newGroupingColumn;
    vm.groupingDetail.key = 'FORM.BUTTONS.GROUP_BY_TRANSACTION';
  }

  function  groupByAccount(currenteGroupingColumn, newGroupingColumn) {
    vm.columns.setVisibleColumns({trans_id : false, balance_before : true, balance_final : true});

    journalPostingModalService.getDataByAccount(vm.dataByTrans)
      .then(function (data) {
        vm.dataByAccount = data;
        vm.gridOptions.data = vm.dataByAccount;
        vm.groupingDetail.selected = newGroupingColumn;
        vm.groupingDetail.key = 'FORM.BUTTONS.GROUP_BY_ACCOUNT';
      })
      .catch(function (error) {
        vm.hasError = true;
        // Notify.errorHandler(error);
    });
  }

  /**
   * @function submit
   * @description for submitting a dialog content
   */
  function submit() {
    ModalInstance.close();
  }

  /**
   * @function cancel
   * @description
   * closes the modal and stop the posting process
   **/
  function cancel() {
    ModalInstance.close();
  }

  /**
   *  @function switchGroup
   * @description
   * This method can change the grouping from by transaction to by account vice versa
   **/
  function switchGroup (){
    
    var currentGroupingColumn = journalPostingModalService.getCurrentGroupingColumn();
    var newGroupingColumn = journalPostingModalService.switchGroup(currentGroupingColumn);
    vm.groupingDetail[newGroupingColumn](currentGroupingColumn, newGroupingColumn);
    vm.grouping.changeGrouping(newGroupingColumn);
  }

  /**
   * @function openErrorViewerModal
   * @description
   * Shows a modal to print errors and warnings
   */
  function openErrorViewerModal () {
    journalPostingModalService.openErrorViewerModal(vm.errors, vm.feedBack, vm.cssClass);
  };

  journalPostingModalService.checkTransactions(vm.dataByTrans)
    .then(function(errors){
      vm.errors = errors;
      vm.feedBack = journalPostingModalService.getFeedBack(errors.data); //getting a feedback object to customize the grid
      vm.cssClass = journalPostingModalService.getCSSClass(vm.feedBack);

      columns.forEach(function (col) {
        col.headerCellClass = vm.cssClass;
      });

      vm.gridOptions = {
        enableColumnMenus : false,
        treeRowHeaderAlwaysVisible: false,
        appScopeProvider : vm
      };
      vm.columns = new Columns(vm.gridOptions, cacheKey);
      vm.grouping  = new Grouping(vm.gridOptions, false, vm.groupingDetail.initial);
      vm.gridOptions.columnDefs = columns;
      vm.gridOptions.data = vm.dataByTrans;
      journalPostingModalService.postingModalService(vm.gridOptions);
    });

  vm.submit = submit;
  vm.cancel = cancel;
  vm.switchGroup = switchGroup;
  vm.openErrorViewerModal = openErrorViewerModal;
}
