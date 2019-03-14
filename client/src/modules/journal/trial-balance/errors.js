angular.module('bhima.controllers')
  .controller('TrialBalanceErrorsController', TrialBalanceErrorsController);

TrialBalanceErrorsController.$inject = [
  'TrialBalanceService', 'NotifyService', '$state',
];

/**
 * @overview TrialBalanceErrorsController
 *
 * @description
 * This controller provides a view of the errors in the selected transactions
 * for the Trial Balance.
 */
function TrialBalanceErrorsController(TrialBalance, Notify, $state) {
  const vm = this;

  // FIXME(@jniles): why doesn't ui-sref work here?
  vm.goToOverviewView = () => $state.go('TrialBalanceOverview');

  // links the errors to the posting journal via their record uuid
  const link = `<div class="ui-grid-cell-contents">
      <bh-journal-link record-uuid="row.entity.record_uuid" display="{{row.entity.trans_id}}"></bh-journal-link>
    </div>`;

  const columns = [{
    field            : 'code',
    displayName      : 'TABLE.COLUMNS.ERROR_TYPE',
    headerCellFilter : 'translate',
    cellFilter       : 'translate',
    headerCellClass  : 'ui-grid-header-cell-error',
  },
  {
    field            : 'error_description',
    displayName      : 'FORM.LABELS.DESCRIPTION',
    headerCellFilter : 'translate',
    headerCellClass  : 'ui-grid-header-cell-error',
  }];


  vm.gridOptions = {
    appScopeProvider : vm,
    enableColumnMenus : false,
    columnDefs       : columns,
    flatEntityAccess : true,
    fastWatch        : true,
  };

  /**
   * @function errorHandler
   * @description
   * This method correctly handles any errors by notifying the user through
   * the NotifyService and by setting the error flag to
   */
  function errorHandler(err) {
    vm.hasError = true;
    Notify.handleError(err);
  }

  // runs on startup
  function startup() {
    vm.loading = true;

    // load the errors from the Trial Balance
    TrialBalance.errors()
      .then(errors => {
        vm.gridOptions.data = errors;
      })
      .catch(errorHandler)
      .finally(() => {
        vm.loading = false;
      });
  }

  startup();
}
