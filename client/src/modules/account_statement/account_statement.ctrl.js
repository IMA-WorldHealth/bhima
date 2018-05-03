angular.module('bhima.controllers')
  .controller('AccountStatementController', AccountStatementController);

AccountStatementController.$inject = [
  'GeneralLedgerService', 'NotifyService', 'JournalService',
  'GridSortingService', 'GridFilteringService', 'GridColumnService',
  'SessionService', 'bhConstants', 'uiGridConstants', 'AccountStatementService',
  'ModalService', 'LanguageService', 'GridExportService', 'TransactionService',
  'GridStateService', '$state', 'AccountService', '$httpParamSerializer',
];

/**
 * @module AccountStatementController
 *
 * @description
 * This controller powers the Account Statement module.  Account Statement is
 * a module used to analyze the transactions that have hit a particular account.
 */
function AccountStatementController(
  GeneralLedger, Notify, Journal, Sorting, Filtering, Columns, Session,
  bhConstants, uiGridConstants, AccountStatement, Modal, Languages,
  GridExport, Transactions, GridState, $state, Accounts, $httpParamSerializer
) {
  // global variables
  const vm = this;
  const cacheKey = 'account-statement';

  // expose to the view
  vm.selectedRows = [];
  vm.enterprise = Session.enterprise;

  // grid definition ================================================================
  vm.gridApi = {};

  vm.gridOptions = {
    enableColumnMenus        : false,
    showColumnFooter         : true,
    appScopeProvider         : vm,
    fastWatch : true,
    flatEntityAccess         : true,
    enableRowHeaderSelection : true,
    onRegisterApi            : onRegisterApiFn,
  };

  // Initialise each of the account statement utilities
  const sorting = new Sorting(vm.gridOptions);
  const filtering = new Filtering(vm.gridOptions, cacheKey);
  const columnConfig = new Columns(vm.gridOptions, cacheKey);
  const exportation = new GridExport(vm.gridOptions, 'selected', 'visible');
  const state = new GridState(vm.gridOptions, cacheKey);

  // attaching the filtering object to the view
  vm.filtering = filtering;

  const currencyCellTemplate = `
    <div class="ui-grid-cell-contents text-right">
      <span ng-hide="row.groupHeader">{{ COL_FIELD | currency: row.entity.currency_id }}</span>
      <span ng-show="row.groupHeader">{{ COL_FIELD | currency: row.treeNode.children[0].row.entity.currency_id }}</span>
    </div>`;


  // columns definition
  const columns = [{
    field            : 'trans_id',
    displayName      : 'TABLE.COLUMNS.TRANSACTION',
    headerCellFilter : 'translate',
    sortingAlgorithm : sorting.transactionIds,
    width            : 110,
    cellTemplate     : 'modules/journal/templates/hide-groups-label.cell.html',
  }, {
    field                : 'trans_date',
    displayName          : 'TABLE.COLUMNS.DATE',
    headerCellFilter     : 'translate',
    cellFilter           : 'date:"'.concat(bhConstants.dates.format, '"'),
    filter               : { condition : filtering.filterByDate },
    editableCellTemplate : 'modules/journal/templates/date.edit.html',
    footerCellTemplate   : '<i></i>',
  }, {
    field            : 'account_number',
    displayName      : 'TABLE.COLUMNS.ACCOUNT',
    width            : 110,
    headerCellFilter : 'translate',
  }, {
    field            : 'account_label',
    displayName      : 'FORM.LABELS.ACCOUNT_TITLE',
    visible : false,
    headerCellFilter : 'translate',
  }, {
    field            : 'debit_equiv',
    type : 'number',
    displayName      : 'TABLE.COLUMNS.DEBIT',
    headerCellFilter : 'translate',
    cellFilter       : 'currency:'.concat(vm.enterprise.currency_id),
    cellClass        : 'text-right',
    enableFiltering  : true,
    aggregationType  : uiGridConstants.aggregationTypes.sum,
    aggregationHideLabel : true,
    footerCellFilter : 'currency:'.concat(vm.enterprise.currency_id),
    footerCellClass  : 'text-right',
  }, {
    field            : 'credit_equiv',
    type : 'number',
    displayName      : 'TABLE.COLUMNS.CREDIT',
    headerCellFilter : 'translate',
    cellFilter       : 'currency:grid.appScope.enterprise.currency_id',
    cellClass        : 'text-right',
    enableFiltering  : true,
    aggregationType  : uiGridConstants.aggregationTypes.sum,
    aggregationHideLabel : true,
    footerCellFilter : 'currency:grid.appScope.enterprise.currency_id',
    footerCellClass  : 'text-right',
  }, {
    field              : 'description',
    displayName        : 'TABLE.COLUMNS.DESCRIPTION',
    headerCellFilter   : 'translate',
    footerCellTemplate : '<i></i>',
  }, {
    field            : 'project_name',
    displayName      : 'TABLE.COLUMNS.PROJECT',
    headerCellFilter : 'translate',
    visible          : false,
  }, {
    field            : 'period_end',
    displayName      : 'TABLE.COLUMNS.PERIOD',
    headerCellFilter : 'translate',
    cellTemplate     : 'modules/templates/bhPeriod.tmpl.html',
    visible          : false,
  }, {
    field                : 'hrRecord',
    displayName          : 'TABLE.COLUMNS.RECORD',
    headerCellFilter     : 'translate',
    footerCellTemplate   : '<i></i>',
    visible              : false,
  }, {
    field            : 'currencyName',
    displayName      : 'TABLE.COLUMNS.CURRENCY',
    headerCellFilter : 'translate',
    visible          : false,
  }, {
    field            : 'debit',
    type : 'number',
    displayName      : 'TABLE.COLUMNS.DEBIT_SOURCE',
    headerCellFilter : 'translate',
    enableFiltering  : true,
    aggregationType  : uiGridConstants.aggregationTypes.sum,
    aggregationHideLabel : true,
    cellTemplate : currencyCellTemplate,
    footerCellTemplate : '<i></i>',
    visible          : false,
  }, {
    field            : 'credit',
    type : 'number',
    displayName      : 'TABLE.COLUMNS.CREDIT_SOURCE',
    headerCellFilter : 'translate',
    enableFiltering  : true,
    aggregationType  : uiGridConstants.aggregationTypes.sum,
    aggregationHideLabel : true,
    cellTemplate : currencyCellTemplate,
    footerCellTemplate   : '<i></i>',
    visible          : false,
  }, {
    field                : 'hrEntity',
    displayName          : 'TABLE.COLUMNS.RECIPIENT',
    headerCellFilter     : 'translate',
    cellTemplate :
      `<div class="ui-grid-cell-contents">
        <bh-reference-link ng-if="row.entity.hrRecord" reference="row.entity.hrRecord" />
      </div>`,
    visible              : true,
  }, {
    field            : 'hrReference',
    displayName      : 'TABLE.COLUMNS.REFERENCE',
    cellTemplate :
      `<div class="ui-grid-cell-contents">
        <bh-reference-link ng-if="row.entity.hrReference" reference="row.entity.hrReference" />
      </div>`,
    headerCellFilter : 'translate',
    visible          : true,
  }, {
    field            : 'transaction_type_id',
    displayName      : 'FORM.LABELS.TRANSACTION_TYPE',
    headerCellFilter : 'translate',
    cellTemplate     : '/modules/journal/templates/transaction_type.html',
    visible          : false,
  }, {
    field            : 'comment',
    displayName      : 'FORM.LABELS.COMMENT',
    headerCellFilter : 'translate',
    visible          : true,
  }, {
    field            : 'display_name',
    displayName      : 'TABLE.COLUMNS.RESPONSIBLE',
    headerCellFilter : 'translate',
    visible          : false,
  }];

  vm.gridOptions.columnDefs = columns;

  // on register api
  function onRegisterApiFn(api) {
    vm.gridApi = api;
  }

  // end grid definition =============================================================

  // comment selected rows
  vm.commentRows = function commentRows() {
    vm.selectedRows = vm.gridApi.selection.getSelectedGridRows();
    Transactions.openCommentModal({ rows : vm.selectedRows })
      .then(comment => {
        if (!comment) { return; }
        updateGridComment(vm.selectedRows, comment);
        Notify.success('ACCOUNT_STATEMENT.SUCCESSFULLY_COMMENTED');
      })
      .catch(err => {
        if (err) { Notify.handleError(err); }
      });
  };

  // update local rows
  function updateGridComment(rows, comment) {
    rows.forEach((row) => {
      row.entity.comment = comment;
    });
  }

  // This function opens a modal through column service to let the user show or Hide columns
  vm.openColumnConfigModal = function openColumnConfigModal() {
    columnConfig.openConfigurationModal();
  };

  // open search modal
  vm.openSearchModal = function openSearchModal() {
    const filtersSnapshot = AccountStatement.filters.formatHTTP();

    Journal.openSearchModal(filtersSnapshot, {
      hasDefaultAccount : true,
      title : 'ACCOUNT_STATEMENT.TITLE',
      hidePostedOption : true,
    })
      .then(changes => {
        AccountStatement.filters.replaceFilters(changes);

        AccountStatement.cacheFilters();
        vm.latestViewFilters = AccountStatement.filters.formatView();

        vm.loading = false;
        load(AccountStatement.filters.formatHTTP(true));
      });
  };

  // remove a filter with from the filter object, save the filters and reload
  vm.onRemoveFilter = function onRemoveFilter(key) {
    AccountStatement.removeFilter(key);
    AccountStatement.cacheFilters();
    vm.latestViewFilters = AccountStatement.filters.formatView();
    load(AccountStatement.filters.formatHTTP(true));
  };

  // exports zone =====================================================================

  // format parameters
  function formatExportParameters(type) {
    // make sure a row is selected before running the trial balance
    if (vm.gridApi.selection.getSelectedGridRows().length < 1) {
      Notify.warn('POSTING_JOURNAL.WARNINGS.NO_TRANSACTIONS_SELECTED');
      return 0;
    }

    const uuids = vm.gridApi.selection.getSelectedGridRows()
      .map(row => row.entity.uuid);

    return { renderer : type || 'pdf', lang : Languages.key, uuids };
  }

  // export pdf
  vm.exportPdf = function exportPdf() {
    var url = '/reports/finance/account_statement';
    var params = formatExportParameters('pdf');

    if (!params) { return; }
    Modal.openReports({ url, params });
  };

  // export excel
  vm.exportExcel = function exportExcel() {
    const filterOpts = AccountStatement.filters.formatHTTP();
    const defaultOpts = {
      renderer : 'xlsx',
      lang : Languages.key,
    };
    // combine options
    const options = angular.merge(defaultOpts, filterOpts);
    // return  serialized options
    return $httpParamSerializer(options);
  };
  // export csv
  vm.exportCsv = function exportCsv() {
    exportation.run();
  };
  // end exports zone =================================================================

  // runs on startup
  function startup() {
    const hasStateFilters = $state.params.filters.length > 0;
    if (hasStateFilters) {
      AccountStatement.filters.replaceFiltersFromState($state.params.filters);
    }

    load(AccountStatement.filters.formatHTTP(true));
    vm.latestViewFilters = AccountStatement.filters.formatView();
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  // startup
  function load(options) {
    toggleLoadingIndicator();

    vm.hasErrors = false;

    vm.gridOptions.gridFooterTemplate = null;
    vm.gridOptions.showGridFooter = false;
    vm.balances = {
      opening : 0,
      debits : 0,
      credits : 0,
      difference : 0,
    };

    // load the opening balance for the range
    Accounts.getOpeningBalanceForPeriod(options.account_id, options)
      .then((balances) => {
        vm.balances.opening = balances.balance;
        vm.balances.ending = vm.balances.opening + vm.balances.difference;
      })
      .catch(Notify.handleError);

    GeneralLedger.read(null, options)
      .then(data => {
        vm.gridOptions.data = data;

        // compute the difference between the debits and credits
        // TODO(@jniles) - is there a way to get this from ui grid's aggregation?
        const balances = data.reduce(computeTransactionBalances, {
          debits : 0,
          credits : 0,
          difference : 0,
        });

        vm.balances.debits = balances.debits;
        vm.balances.credits = balances.credits;
        vm.balances.difference = balances.difference;
        vm.balances.ending = vm.balances.opening + balances.difference;

        vm.gridOptions.showGridFooter = true;
        vm.gridOptions.gridFooterTemplate = '/modules/account_statement/grid.footer.html';

        // @TODO investigate why footer totals aren't updated automatically on data change
        vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
      })
      .catch(Notify.handleError)
      .finally(toggleLoadingIndicator);
  }

  // computes the balances used in the grid footer
  function computeTransactionBalances(aggregates, row) {
    aggregates.debits += row.debit_equiv;
    aggregates.credits += row.credit_equiv;
    aggregates.difference += (row.debit_equiv - row.credit_equiv);
    return aggregates;
  }

  vm.saveGridState = state.saveGridState;
  vm.clearGridState = function clearGridState() {
    state.clearGridState();
    $state.reload();
  };

  startup();
}
