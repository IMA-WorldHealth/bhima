angular.module('bhima.controllers')
  .controller('JournalPosterModalController', JournalPosterModalController);

JournalPosterModalController.$inject = [ 
  '$uibModalInstance', 'SessionService', 'JournalPostingModalService',
  'GridGroupingService', 'Records', 'GridColumnService', 'NotifyService', '$state'
];

/**
 * @module journal/modals/JournalPoster.modal
 *
 * @description
 * This controller provides a tool to do trial balance
 */
function JournalPosterModalController(ModalInstance, Session, journalPostingModalService, Grouping,  records, Columns, Notify, $state) {
  var vm = this;
  var columns = [
    { field : 'trans_id', displayName : 'TABLE.COLUMNS.TRANSACTION', headerCellFilter: 'translate'},
    { field : 'account_number', displayName : 'TABLE.COLUMNS.ACCOUNT', headerCellFilter: 'translate'},
    { field : 'balance_before',
      displayName : 'TABLE.COLUMNS.BEFORE',
      headerCellFilter : 'translate',
      cellFilter : 'currency:' + Session.enterprise.currency_id,
      visible : false
    },
    { field : 'debit_equiv', displayName : 'TABLE.COLUMNS.DEBIT', headerCellFilter: 'translate', cellTemplate : '/partials/templates/grid/debit_equiv.cell.html' },
    { field : 'credit_equiv', displayName : 'TABLE.COLUMNS.CREDIT', headerCellFilter: 'translate', cellTemplate : '/partials/templates/grid/credit_equiv.cell.html'},
    { field : 'balance_final',
      displayName : 'TABLE.COLUMNS.AFTER',
      headerCellFilter : 'translate',
      cellFilter : 'currency:' + Session.enterprise.currency_id,
      visible : false
    }
  ];

  vm.enterprise = Session.enterprise;
  vm.viewDetail = { 'trans' : transactionView, 'account' : accountView, 'initial' : 'trans', key : 'FORM.BUTTONS.GROUP_BY_ACCOUNT', selected : 'trans'};
  vm.gridOptions = {
    enableColumnMenus: false,
    treeRowHeaderAlwaysVisible: false,
    appScopeProvider: vm
  };
  vm.dataByTrans = journalPostingModalService.parseSelectedGridRecord(records); //parse grid row to printable format
  vm.columns = new Columns(vm.gridOptions);
  vm.grouping = new Grouping(vm.gridOptions, false);
  vm.gridOptions.columnDefs = columns;
  vm.gridOptions.data = vm.dataByTrans;
  vm.loading = true;

  function transactionView() {
    vm.columns.setVisibleColumns({trans_id : true, balance_before : false, balance_final : false});
    vm.gridOptions.data = vm.dataByTrans;
    vm.viewDetail.key = 'FORM.BUTTONS.GROUP_BY_ACCOUNT';
    vm.viewDetail.selected = 'trans';
    vm.grouping.changeGrouping('trans_id');
  }

  function accountView() {
    vm.columns.setVisibleColumns({trans_id : false, balance_before : true, balance_final : true});

    journalPostingModalService.getDataByAccount(vm.dataByTrans)
      .then(function (data) {
        vm.gridOptions.data = data;
        vm.viewDetail.key = 'FORM.BUTTONS.GROUP_BY_TRANSACTION';
        vm.viewDetail.selected = 'account';
        vm.grouping.removeGrouping();
      })
      .catch(function (error) {
        vm.hasError = true;
        Notify.handleError(error);
      });
  }

  /**
   * @function submit
   * @description for submitting a dialog content
   */
  function submit() {
    journalPostingModalService.postToGeneralLedger(vm.dataByTrans)
      .then(function () {
        $state.go('generalLedger', null, {reload : true});
      });
    ModalInstance.close();
  }

  /**
   * @function cancel
   * @description
   * closes the modal and stop the posting process
   **/
  function cancel() {
    ModalInstance.dismiss();
  }

  /**
   *  @function switchView
   * @description
   * This method can change the view from transaction view to account view vice versa
   **/
  function switchView (){
    var newView = journalPostingModalService.switchView(vm.viewDetail.selected);
    vm.viewDetail[newView]();
  }

  /**
   * @function openErrorViewerModal
   * @description
   * Shows a modal to print errors and warnings
   */
  function openErrorViewerModal () {
    journalPostingModalService.openErrorViewerModal(vm.errors, vm.feedBack, vm.cssClass);
  }

  journalPostingModalService.checkTransactions(vm.dataByTrans)
    .then(function(errors) {
      vm.errors = errors;
      vm.feedBack = journalPostingModalService.getFeedBack(errors.data); //getting a feedback object to customize the grid
      vm.cssClass = journalPostingModalService.getCSSClass(vm.feedBack);

      columns.forEach(function (col) {
        col.headerCellClass = vm.cssClass;
      });
    })
    .catch(function (err) {
      Notify.handleError(err);
    })
    .finally(function () {
      vm.loading = false;
    });


  vm.submit = submit;
  vm.cancel = cancel;
  vm.switchView = switchView;
  vm.openErrorViewerModal = openErrorViewerModal;
}
