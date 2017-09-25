angular.module('bhima.controllers')
  .controller('TrialBalanceOverviewController', TrialBalanceOverviewController);

TrialBalanceOverviewController.$inject = [
  'SessionService', 'TrialBalanceService', 'NotifyService', 'uiGridConstants', 'GridExportService',
];

/**
 * @module TrialBalanceOverviewController
 *
 * @description
 * This controller is responsible for displaying the Trial Balance data to the user.
 */
function TrialBalanceOverviewController(Session, TrialBalance, Notify, uiGridConstants, GridExport) {
  var vm = this;
  var currencyId = Session.enterprise.currency_id;

  var columns;

  var GRID_HEADER_ERROR_CLASS = 'ui-grid-header-cell-error';
  var GRID_HEADER_DEFAULT_CLASS = 'ui-grid-header-cell-primary';

  // default false
  vm.loading = false;

  columns = [{
    field            : 'hrLabel',
    displayName      : 'TABLE.COLUMNS.ACCOUNT',
    headerCellFilter : 'translate',
  }, {
    field            : 'balance_before',
    type             : 'number',
    displayName      : 'TABLE.COLUMNS.BEFORE',
    headerCellFilter : 'translate',
    cellClass        : 'text-right',
    cellFilter       : 'currency:'.concat(currencyId),
  }, {
    field                : 'debit_equiv',
    type                 : 'number',
    displayName          : 'TABLE.COLUMNS.DEBIT',
    headerCellFilter     : 'translate',
    cellClass            : 'text-right',
    cellFilter           : 'currency:'.concat(currencyId),
    footerCellClass      : 'text-right text-danger',
    footerCellFilter     : 'currency:'.concat(currencyId),
    aggregationType      : uiGridConstants.aggregationTypes.sum,
    aggregationHideLabel : true,
  }, {
    field                : 'credit_equiv',
    type                 : 'number',
    displayName          : 'TABLE.COLUMNS.CREDIT',
    headerCellFilter     : 'translate',
    cellClass            : 'text-right',
    cellFilter           : 'currency:'.concat(currencyId),
    footerCellClass      : 'text-right text-danger',
    footerCellFilter     : 'currency:'.concat(currencyId),
    aggregationType      : uiGridConstants.aggregationTypes.sum,
    aggregationHideLabel : true,
  }, {
    field            : 'balance_final',
    type             : 'number',
    displayName      : 'TABLE.COLUMNS.AFTER',
    headerCellFilter : 'translate',
    cellClass        : 'text-right',
    cellFilter       : 'currency:'.concat(currencyId),
  }, {
    field            : 'actions',
    displayName      : '',
    headerCellFilter : 'translate',
    enableSorting    : false,
    cellTemplate     : '/modules/journal/templates/details-link.cell.html',
  }];

  vm.gridOptions = {
    enableColumnMenus : false,
    showColumnFooter  : false,
    enabledSorting    : true,
    fastWatch         : true,
    flatEntityAccess  : true,
    columnDefs        : columns,
    enableColumnResizing : true,
    onRegisterApi : onRegisterApi,
  };

  function onRegisterApi(api) {
    vm.gridApi = api;
  }

  // FIXME(@jniles) - this is kind of hacky
  TrialBalance.bindGridExporter(
    new GridExport(vm.gridOptions, 'all', 'visible')
  );

  /**
   * @function errorHandler
   * @description
   * This method handle correctly error by notifying the user through
   * the NotifyService and by setting to true the error flag
   */
  function errorHandler(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  /**
   * @function toggleLoadingIndicator
   *
   * @description
   * Toggles the grid loading state on and off.
   */
  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  function startup() {
    toggleLoadingIndicator();

    // fetch the trial balance summary.
    TrialBalance.summary()
      .then(function (summary) {
        vm.gridOptions.data = summary;
      })
      .catch(errorHandler)
      .finally(toggleLoadingIndicator);

    TrialBalance.errors()
      .then(function (errors) {
        var headerCellClass;
        var hasErrors = Boolean(errors.length);

        // only show the column footer if there are errors in the grid.
        vm.gridOptions.showColumnFooter = hasErrors;

        headerCellClass = hasErrors ? GRID_HEADER_ERROR_CLASS : GRID_HEADER_DEFAULT_CLASS;
        angular.forEach(columns, function (column) {
          column.headerCellClass = headerCellClass;
        });

        // make sure the link to error page is displayed.
        vm.showErrorLink = hasErrors;

        // if the grid API is available at this time, notify it that that data has changed.
        if (vm.gridApi) {
          vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
          vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);
        }
      })
      .catch(errorHandler);
  }

  startup();
}
