// angular.module('bhima.controllers')
//   .controller('JournalPosterModalController', JournalPosterModalController);
//
// JournalPosterModalController.$inject = [ 
//   '$uibModalInstance', 'SessionService', 'JournalPostingModalService',
//   'GridGroupingService', 'Records', 'GridColumnService', 'NotifyService',
//   '$state', '$timeout'
// ];
//
// /**
//  * @module journal/modals/JournalPoster.modal
//  *
//  * @description
//  * This controller provides a tool to do trial balance
//  */
// function JournalPosterModalController(ModalInstance, Session, journalPostingModalService, Grouping,  records, Columns, Notify, $state, $timeout) {
//   var vm = this;
//   var columns = [
//     { field : 'trans_id', displayName : 'TABLE.COLUMNS.TRANSACTION', headerCellFilter: 'translate', visible : false},
//     { field : 'account_number', displayName : 'TABLE.COLUMNS.ACCOUNT', headerCellFilter: 'translate'},
//     { field : 'code', displayName : 'TABLE.COLUMNS.ERROR_TYPE', headerCellFilter : 'translate', visible : false},
//     {field : 'transaction', displayName : 'TABLE.COLUMNS.TRANSACTION', headerCellFilter : 'translate', visible : false},
//     { field : 'balance_before',
//       displayName : 'TABLE.COLUMNS.BEFORE',
//       headerCellFilter : 'translate',
//       cellFilter : 'currency:' + Session.enterprise.currency_id,
//       visible : true
//     },
//     { field : 'debit_equiv', displayName : 'TABLE.COLUMNS.DEBIT', headerCellFilter: 'translate', cellTemplate : '/partials/templates/grid/debit_equiv.cell.html' },
//     { field : 'credit_equiv', displayName : 'TABLE.COLUMNS.CREDIT', headerCellFilter: 'translate', cellTemplate : '/partials/templates/grid/credit_equiv.cell.html'},
//     { field : 'balance_final',
//       displayName : 'TABLE.COLUMNS.AFTER',
//       headerCellFilter : 'translate',
//       cellFilter : 'currency:' + Session.enterprise.currency_id,
//       visible : true
//     },
//     { field : 'actions',
//       displayName : '',
//       headerCellFilter: 'translate',
//       visible: true,
//       enableCellEdit: false,
//       cellTemplate: '/partials/journal/templates/trial_balance_actions.cell.html',
//       allowCellFocus: false
//     }
//   ];
//
//   vm.enterprise = Session.enterprise;
//   vm.dataByTrans = journalPostingModalService.parseSelectedGridRecord(records); //parse grid row to printable format
//   vm.viewDetail = {
//     'trans' : transactionView,
//     'account' : accountView,
//     key : 'FORM.BUTTONS.GROUP_BY_ACCOUNT',
//     selected : 'account'
//   };
//   vm.gridOptions = {
//     enableColumnMenus: false,
//     treeRowHeaderAlwaysVisible: false,
//     appScopeProvider: vm,
//     columnDefs : columns
//   };
//   vm.grouping = new Grouping(vm.gridOptions, false);
//   vm.columns = new Columns(vm.gridOptions);
//   vm.loading = true;
//
//   /**
//    * @function : fetchDataByAccount
//    * @description :
//    * This function fetch data by account from the server
//    * through the journal posting service module   *
//    **/
//   function fetchDataByAccount(){
//     return journalPostingModalService.getDataByAccount(vm.dataByTrans);
//   }
//
//   /**
//    * @function : transactionView
//    * @description :
//    * This function is responsible of felling the grid data and grouping them by transaction
//    * - It begins by configuring column visibility
//    * - Fill the data
//    * - Changed the selected view, to facilitate the controller to recover the view from an other view when necessary
//    * - Grouping the data by transaction
//    *
//    * This view is one of the two mains views because from this view you can post to the general ledger
//    **/
//   function transactionView() {
//     vm.columns.setVisibleColumns({
//       balance_before : false,
//       balance_final : false,
//       actions : false,
//       code : false,
//       transaction : false,
//       debit_equiv : true,
//       credit_equiv : true,
//       trans_id : true,
//       account_number : true
//     });
//     vm.gridOptions.data = vm.dataByTrans;
//     vm.viewDetail.key = 'FORM.BUTTONS.GROUP_BY_ACCOUNT';
//     vm.viewDetail.selected = 'trans';
//     vm.grouping.changeGrouping('trans_id');
//   }
//
//   /**
//    * @function : accountView
//    * @description :
//    * This function is responsible of felling the grid data by account
//    * - It begins by configuring column visibility
//    * - Fill the data through the fetchDataByAccount function
//    * - Changed the selected view, to facilitate the controller to recover the view from an other view when necessary
//    * - Removing grouping because data are aggregated from database server
//    *
//    * This view is one of the two mains views because from this view you can post to the general ledger
//    **/
//   function accountView() {
//     vm.columns.setVisibleColumns({
//       balance_before : true,
//       balance_final : true,
//       actions : true,
//       debit_equiv : true,
//       credit_equiv : true,
//       account_number : true,
//       code : false,
//       transaction : false,
//       trans_id : false
//     });
//     fetchDataByAccount()
//       .then(function (data) {
//         vm.gridOptions.data = data;
//         vm.viewDetail.key = 'FORM.BUTTONS.GROUP_BY_TRANSACTION';
//         vm.viewDetail.selected = 'account';
//         vm.grouping.removeGrouping();
//       })
//       .catch(function (error) {
//         vm.hasError = true;
//         Notify.handleError(error);
//       });
//   }
//
//   /**
//    * @function : viewSelectedTransaction
//    *
//    * @param {Integer) accountId, the account ID
//    *
//    * @description :
//    * From the account view, this function help to see every transaction relative to one account,
//    * in order to understand the amounts listed.
//    *
//    * This function fills the grid data by transaction :
//    * - It begins by configuring column visibility
//    * - Fill the data through the getRelatedTransaction function of the journal posting service
//    * - Grouping data by transaction
//    * - Setting the detailView flag to true
//    *
//    * This view is not the main view, because you can not post to the general ledger from this view,
//    * you have to reset the view to the last main view first, this view is just giving complementary information to the user.
//    **/
//   function viewSelectedTransaction(accountId) {
//     vm.columns.setVisibleColumns({
//       balance_before : false,
//       balance_final : false,
//       actions : false,
//       code : false,
//       transaction : false,
//       debit_equiv : true,
//       credit_equiv : true,
//       trans_id : true,
//       account_number : true,
//     });
//     vm.gridOptions.data = journalPostingModalService.getRelatedTransaction(accountId, vm.dataByTrans);
//     vm.grouping.changeGrouping('trans_id');
//     vm.detailedView = true;
//   }
//
//   /**
//    * @function : viewErrorReport
//    *
//    * @description :
//    * From whatever view, this function help to see every errors and warnings relative to a selected set of transaction
//    *
//    * This function fills the grid data by error code :
//    * - It begins by configuring column visibility
//    * - Fill the data through the parseGridRecord function of the journal error service
//    * - Grouping data by code
//    * - Setting the detailView flag to true
//    *
//    * This view is not the main view, because you can not post to the general ledger from this view,
//    * you have to reset the view to the last main view first, this view is just giving complementary information to the user.
//    **/
//   function viewErrorReport () {
//     vm.columns.setVisibleColumns({
//       balance_before : false,
//       balance_final : false,
//       actions : false,
//       debit_equiv : false,
//       credit_equiv : false,
//       trans_id : false,
//       account_number : false,
//       code : true,
//       transaction : true
//     });
//     vm.gridOptions.data = journalPostingModalService.parseErrorRecord(vm.errors.data);
//     vm.grouping.changeGrouping('code');
//     vm.detailedView = true;
//   }
//
//   /**
//    * @function submit
//    * @description for submitting a dialog content
//    */
//   function submit() {
//     journalPostingModalService.postToGeneralLedger(vm.dataByTrans)
//       .then(function () {
//         $state.go('generalLedger', null, {reload : true});
//       });
//     ModalInstance.close();
//   }
//
//   /**
//    * @function cancel
//    * @description
//    * closes the modal and stop the posting process
//    **/
//   function cancel() {
//     ModalInstance.dismiss();
//   }
//
//   /**
//    * @function resetView
//    * @description
//    * This function is responsible of resetting the view from the no main view to
//    * the a last main view selected
//    **/
//   function resetView() {
//     vm.viewDetail[vm.viewDetail.selected]();
//     vm.detailedView = false;
//   }
//
//   /**
//    *  @function switchView
//    * @description
//    * This method can change the view from transaction view to account view vice versa
//    **/
//   function switchView (){
//     var newView = journalPostingModalService.switchView(vm.viewDetail.selected);
//     vm.viewDetail[newView]();
//   }
//
//   journalPostingModalService.checkTransactions(vm.dataByTrans)
//     .then(function(errors) {
//       vm.errors = errors;
//       vm.feedBack = journalPostingModalService.getFeedBack(errors.data); //getting a feedback object to customize the grid
//       vm.cssClass = journalPostingModalService.getCSSClass(vm.feedBack);
//       columns.forEach(function (col) {
//         col.headerCellClass = vm.cssClass;
//       });
//     })
//     .catch(function (err) {
//       Notify.handleError(err);
//     })
//     .finally(function () {
//       vm.loading = false;
//     });
//
//   fetchDataByAccount()
//     .then(function (data) {
//       vm.gridOptions.data = data;
//       $timeout(vm.grouping.removeGrouping, 0, false);
//     })
//     .catch(function (err) {
//       Notify.handleError(err);
//     });
//
//   vm.resetView = resetView;
//   vm.submit = submit;
//   vm.cancel = cancel;
//   vm.switchView = switchView;
//   vm.viewErrorReport = viewErrorReport;
//   vm.viewSelectedTransaction = viewSelectedTransaction;
// }
