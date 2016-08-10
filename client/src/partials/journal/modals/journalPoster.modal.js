angular.module('bhima.controllers')
  .controller('JournalPosterModalController', JournalPosterModalController);

JournalPosterModalController.$inject = [ '$uibModalInstance', 'SessionService'];

/**
 * @module journal/modals/JournalPoster.modal
 *
 * @description
 * This controller provides a tool to do trial balance
 */
function JournalPosterModalController(ModalInstance, Session) {
  var vm = this;

  vm.enterprise = Session.enterprise;

  vm.gridOptions = {
    enableColumnMenus : false,
    appScopeProvider : vm,
    data : []
  };

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

  vm.gridOptions.columnDefs = columns;

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

  vm.submit = submit;
  vm.cancel = cancel;
}
