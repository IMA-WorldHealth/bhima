angular.module('bhima.controllers')
  .controller('JournalController', JournalController);

JournalController.$inject = [
  'JournalService', 'GridSortingService', 'GridGroupingService',
  'GridFilteringService', 'GridColumnService',
  'SessionService', 'NotifyService', 'GridEditorService',
  'bhConstants', '$state', 'uiGridConstants', 'ModalService', 'LanguageService',
  'AppCache', 'Store', 'uiGridGroupingConstants', 'ExportService', 'FindEntityService',
  '$rootScope', '$filter', '$translate', 'GridExportService', 'TransactionTypeService', 'GridStateService',
  'GridSelectionService', 'TrialBalanceService',
];

/**
 * @module JournalController
 *
 * @description
 * This controller is responsible for initialising the core client side posting
 * journal, binding the UI Grid component with services that facilitate all
 * operations required by an accountant.
 * - Displaying transactions in an easy to find and review format
 *   - Search for transactions
 *   - Filter transactions
 *   - Group by transactions to show aggregates
 *   - Sort transactions
 *   - Show or hide columns
 *
 * - (Super user) Edit and update transactions
 * - Post one or more transactions to the general ledger to confirm they are complete
 *   - Tun trial balance validation on transactions
 *
 * @todo Propose utility bar view design
 */
function JournalController(Journal, Sorting, Grouping,
  Filtering, Columns, Session, Notify, Editors,
  bhConstants, $state, uiGridConstants, Modal, Languages, AppCache, Store,
  uiGridGroupingConstants, Export, FindEntity, $rootScope, $filter,
  $translate, GridExport, TransactionType, GridState, GridSelection, TrialBalance) {
  // Journal utilities
  var sorting;
  var grouping;
  var filtering;
  var columnConfig;
  // var transactions;
  var exportation;
  var state;
  var selection;

  // store journal data
  var journalStore = new Store({ identifier : 'uuid' });
  var transactionIdToRecordUuidMap;

  /** @const the cache alias for this controller */
  var cacheKey = 'Journal';

  // top level cache
  var cache = AppCache(cacheKey.concat('-module'));
  var vm = this;

  // number of all of the transactions in the system
  Journal.count()
    .then(function (data) {
      vm.numberTotalSystemTransactions = data[0].number_transactions;
    })
    .catch(Notify.handleError);

  vm.enterprise = Session.enterprise;
  vm.languages = Languages;
  vm.gridApi = {};

  // gridOptions is bound to the UI Grid and used to configure many of the
  // options, it is also used by the grid to expose the API
  vm.gridOptions = {
    enableColumnMenus          : false,
    showColumnFooter           : true,
    appScopeProvider           : vm,
    flatEntityAccess           : true,
    enableGroupHeaderSelection : true,
    enableRowHeaderSelection   : true,
    onRegisterApi : function (api) { vm.gridApi = api; }
  };

  vm.grouped = angular.isDefined(cache.grouped) ? cache.grouped : false;

  // Initialise each of the journal utilities, providing them access to the journal
  // configuration options

  sorting = new Sorting(vm.gridOptions);
  filtering = new Filtering(vm.gridOptions, cacheKey);
  grouping = new Grouping(vm.gridOptions, true, 'trans_id', vm.grouped, false);
  columnConfig = new Columns(vm.gridOptions, cacheKey);
  exportation = new GridExport(vm.gridOptions, 'selected', 'visible');
  state = new GridState(vm.gridOptions, cacheKey);
  selection = new GridSelection(vm.gridOptions);

  // attaching the filtering object to the view
  vm.filtering = filtering;

  // attaching the grouping object to the view
  vm.grouping = grouping;

  vm.selection = selection;

  // Attaching the transaction to the view
  // vm.transactions = transactions;

  vm.onRemoveFilter = onRemoveFilter;

  /**
   * @function toggleLoadingIndicator
   *
   * @description
   * Toggles the grid's loading indicator to eliminate the flash when rendering
   * transactions and allow a better UX for slow loads.
   */
  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  vm.saveGridState = state.saveGridState;
  vm.clearGridState = function clearGridState() {
    state.clearGridState();
    $state.reload();
  };

  /**
   * Column definitions; specify the configuration and behaviour for each column
   * in the journal grid. Initialise each of the journal utilities,
   * providing them access to the journal
   * configuration options :
   *    sorting = new Sorting(vm.gridOptions);
   *    grouping = new Grouping(vm.gridOptions);
   *    filtering  = new Filtering(vm.gridOptions);
   *
   * Note:
   *   1. Setting the grouping priority without sorting by the same column will
   *      cause unexpected behaviour (splitting up of groups) when sorting
   *      other columns. This can be avoided by setting default sort and group.
   */
  var columns = [
    { field            : 'uuid',
      displayName      : 'TABLE.COLUMNS.ID',
      headerCellFilter : 'translate',
      visible          : false },

    { field            : 'project_name',
      displayName      : 'TABLE.COLUMNS.PROJECT',
      headerCellFilter : 'translate',
      visible          : false,
      enableCellEdit   : false },

    { field            : 'period_end',
      displayName      : 'TABLE.COLUMNS.PERIOD',
      headerCellFilter : 'translate',
      cellTemplate     : 'modules/templates/bhPeriod.tmpl.html',
      visible          : false },

    { field            : 'trans_id',
      displayName      : 'TABLE.COLUMNS.TRANSACTION',
      headerCellFilter : 'translate',
      sortingAlgorithm : sorting.transactionIds,
      width            : 110,
      cellTemplate     : 'modules/journal/templates/transaction-id.cell.html' },

    { field                            : 'trans_date',
      displayName                      : 'TABLE.COLUMNS.DATE',
      headerCellFilter                 : 'translate',
      cellFilter                       : 'date:"' + bhConstants.dates.format + '"',
      filter                           : { condition: filtering.filterByDate },
      treeAggregationType              : uiGridGroupingConstants.aggregation.MIN,
      customTreeAggregationFinalizerFn : function (aggregation) {
        aggregation.rendered = $filter('date')(aggregation.value, bhConstants.dates.format);
      },
      // note that sort priorities are cached and saved with the grid save state - this default sort will only be applied if the custom settings are cleared
      sort : {
        priority : 0,
        direction : uiGridConstants.DESC
      },
      footerCellTemplate : '<i></i>' },

    { field                : 'hrRecord',
      displayName          : 'TABLE.COLUMNS.RECORD',
      headerCellFilter     : 'translate',
      visible              : true,
      cellTemplate         : '<div class="ui-grid-cell-contents"><bh-reference-link ng-if="row.entity.hrRecord" reference="row.entity.hrRecord" /></div>',
      treeAggregationType  : uiGridGroupingConstants.aggregation.MIN,
      treeAggregationLabel : '',
      footerCellTemplate   : '<i></i>' },

    { field              : 'description',
      displayName        : 'TABLE.COLUMNS.DESCRIPTION',
      headerCellFilter   : 'translate',
      footerCellTemplate : '<i></i>' },

    { field                : 'account_number',
      displayName          : 'TABLE.COLUMNS.ACCOUNT',
      cellTemplate         : '/modules/journal/templates/account.cell.html',
      headerCellFilter     : 'translate',
    }, {
      field                            : 'debit_equiv',
      type                             : 'number',
      displayName                      : 'TABLE.COLUMNS.DEBIT',
      headerCellFilter                 : 'translate',
      treeAggregationType              : uiGridGroupingConstants.aggregation.SUM,
      customTreeAggregationFinalizerFn : function (aggregation) {
        aggregation.rendered = aggregation.value;
      },
      enableFiltering : true,
      footerCellFilter : 'currency:grid.appScope.enterprise.currency_id' },

    { field                            : 'credit_equiv',
      type                             : 'number',
      displayName                      : 'TABLE.COLUMNS.CREDIT',
      headerCellFilter                 : 'translate',
      treeAggregationType              : uiGridGroupingConstants.aggregation.SUM,
      customTreeAggregationFinalizerFn : function (aggregation) {
        aggregation.rendered = aggregation.value;
      },
      enableFiltering : true,
      footerCellFilter : 'currency:grid.appScope.enterprise.currency_id' },

    { field            : 'currencyName',
      displayName      : 'TABLE.COLUMNS.CURRENCY',
      headerCellFilter : 'translate',
      visible          : false },

    { field            : 'debit',
      type             : 'number',
      displayName      : 'TABLE.COLUMNS.DEBIT_SOURCE',
      headerCellFilter : 'translate',
      visible          : false,
      cellTemplate     : '/modules/journal/templates/debit.grid.html' },

    { field            : 'credit',
      type             : 'number',
      displayName      : 'TABLE.COLUMNS.CREDIT_SOURCE',
      headerCellFilter : 'translate',
      visible          : false,
      cellTemplate     : '/modules/journal/templates/credit.grid.html' },

    { field                : 'hrEntity',
      displayName          : 'TABLE.COLUMNS.RECIPIENT',
      headerCellFilter     : 'translate',
      cellTemplate         : '<div class="ui-grid-cell-contents"><bh-reference-link ng-if="row.entity.hrEntity" reference="row.entity.hrEntity" /></div>',
      visible              : true },

    { field            : 'hrReference',
      displayName      : 'TABLE.COLUMNS.REFERENCE',
      cellTemplate     : '<div class="ui-grid-cell-contents"><bh-reference-link ng-if="row.entity.hrReference" reference="row.entity.hrReference" /></div>',
      headerCellFilter : 'translate',
      visible          : true },

    { field                : 'origin_id',
      displayName          : 'FORM.LABELS.TRANSACTION_TYPE',
      headerCellFilter     : 'translate',
      // @FIXME(sfount) transaction types relied on data in the controller that is gone
      // cellTemplate         : '/modules/journal/templates/transaction_type.html',
      visible              : false },

    { field            : 'display_name',
      displayName      : 'TABLE.COLUMNS.RESPONSIBLE',
      headerCellFilter : 'translate',
      visible          : false },
  ];
  vm.gridOptions.columnDefs = columns;

  vm.openColumnConfigModal = function openColumnConfigModal() {
    // column configuration has direct access to the grid API to alter the current
    // state of the columns - this will be saved if the user saves the grid configuration
    columnConfig.openConfigurationModal();
  };

  // This function opens a modal, to let the user posting transaction to the general ledger
  vm.openTrialBalanceModal = function openTrialBalanceModal() {
    // gather the selected transactions together
    var selectedTransactionIds = selection.selected.groups;
    var selectedRecordUuids;

    // make sure a row is selected before running the trial balance
    if (selectedTransactionIds.length === 0) {
      Notify.warn('POSTING_JOURNAL.WARNINGS.NO_TRANSACTIONS_SELECTED');
      return;
    }

    selectedRecordUuids = selectedTransactionIds.map(lookupIntermediateRecordUuid);

    // initialize the data request to the server
    TrialBalance.initialise(selectedRecordUuids);

    // transition to the overview state.  Available states:
    //  1) Overview
    //  2) Errors
    $state.go('TrialBalanceOverview');
  };

  // format Export Parameters
  function formatExportParameters(type) {
    // @TODO(sfount) this should not be requirement for exporting - filter on group like editing
    // make sure a row is selected before running the trial balance
    if (grouping.selectedRowCount < 1) {
      Notify.warn('POSTING_JOURNAL.WARNINGS.NO_TRANSACTIONS_SELECTED');
      return;
    }

    var uuids = vm.grouping.getSelectedGroups().map(function (trans) {
      return trans.uuid;
    });

    return { renderer: type || 'pdf', lang: Languages.key, uuids: uuids };
  }

  // display the journal printable report of selected transactions
  vm.openJournalReport = function openJournalReport() {
    var url = '/reports/finance/journal';
    var params = formatExportParameters('pdf');

    if (!params) { return; }

    Modal.openReports({ url: url, params: params });
  };

  // export data into csv file
  vm.exportFile = function exportFile() {
    exportation.run();
  };


  function errorHandler(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  vm.reloadData = function reloadData() {
    load(Journal.filters.formatHTTP(true));
  };

  // loads data for the journal
  function load(options) {
    vm.loading = true;
    vm.hasError = false;
    vm.unknownTransactionEditState = false;
    vm.gridOptions.gridFooterTemplate = null;
    vm.gridOptions.showGridFooter = false;

    // @fixme
    Journal.grid(null, options)
      .then(function (records) {
        // number of transactions downloaded and shown in the current journal

        // @FIXME(sfount) just get the length of the transaction ID index
        // vm.numberCurrentGridTransactions = records.aggregate.length;
        vm.numberCurrentGridTransactions = 'N/A';

        // pre process data - this should be done in a more generic way in a service
        journalStore.setData(records);

        vm.gridOptions.data = journalStore.data;

        vm.rowsDetails = sumTransactionAggregates(journalStore.data);
        console.log(vm.rowsDetails);

        vm.gridOptions.showGridFooter = true;
        vm.gridOptions.gridFooterTemplate = '/modules/journal/templates/grid.footer.html';

        // map record_uuid -> trans_id
        transactionIdToRecordUuidMap = Journal.mapTransactionIdsToRecordUuids(vm.gridOptions.data);

        // @TODO investigate why footer totals aren't updated automatically on data change
        vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);

        // scrollToRecordUuid() will scroll to a record uuid on initial load...
        // TODO(@jniles) - this is kind of hacky.  We shouldn't have to check the $params on every
        // load(), only on the initial load.  Redesign?
        if ($state.params.scrollTo) {
          transactions.scrollIntoView($state.params.scrollTo);
          delete $state.params.scrollTo;
        }
      })
      .catch(errorHandler)
      .finally(toggleLoadingIndicator);
  }

  // open search modal
  vm.openSearchModal = function openSearchModal() {
    var filtersSnapshot = Journal.filters.formatHTTP();

    Journal.openSearchModal(filtersSnapshot)
      .then(function (changes) {
        Journal.filters.replaceFilters(changes);

        Journal.cacheFilters();
        vm.latestViewFilters = Journal.filters.formatView();

        toggleLoadingIndicator();
        return load(Journal.filters.formatHTTP(true));
      })
      .catch(angular.noop);
  };

  // calculates the total number of transactions and lines respecting
  function sumTransactionAggregates(journalRows) {
    var uniqueTransactions = {};
    var totalRows = journalRows.length;
    var totalPosted = journalRows.reduce(function (sum, row) {
      if (angular.isUndefined(uniqueTransactions[row.record_uuid])) {
        uniqueTransactions[row.record_uuid] = 1;
        return sum + Number(row.posted);
      }
      uniqueTransactions[row.record_uuid] += 1;
      return sum;
    }, 0);

    var totalNonPosted = Object.keys(uniqueTransactions).length - totalPosted;
    var remainingSystemTransactions = vm.numberTotalSystemTransactions - totalNonPosted;

    return {
      totalRows : totalRows,
      totalPosted : totalPosted,
      totalNonPosted : totalNonPosted,
      remainingSystemTransactions : remainingSystemTransactions
    };
  }

  // remove a filter with from the filter object, save the filters and reload
  function onRemoveFilter(key) {
    Journal.removeFilter(key);

    Journal.cacheFilters();
    vm.latestViewFilters = Journal.filters.formatView();

    return load(Journal.filters.formatHTTP(true));
  }

  // @FIXME(sfount) should this not be done in the grouping service?
  vm.toggleTransactionGroup = function toggleTransactionGroup() {
    var transactionColumnKey = 'trans_id';

    // column grouping is permenantly saved if the user saves the current grid state
    if (vm.grouping.getCurrentGroupingColumn()) {
      // grid is currently grouped - toggle should remove the grouping
      vm.grouping.removeGrouping(transactionColumnKey);
      return;
    }

    // grid is not currently grouped - toggle should group on the trans_id column
    vm.grouping.changeGrouping(transactionColumnKey);
  };

  // @TODO this method is called on every single digest to determine if the grid is
  //       currently grouped - this should only be called once on grid load and then
  //       updated to keep track of the current grid grouped state
  vm.gridGroupedState = vm.grouping.getCurrentGroupingColumn;

  // runs on startup
  function startup() {
    var hasStateFilters = $state.params.filters.length > 0;

    if (hasStateFilters) {
      Journal.filters.replaceFiltersFromState($state.params.filters);
      Journal.cacheFilters();
    }

    load(Journal.filters.formatHTTP(true));
    vm.latestViewFilters = Journal.filters.formatView();
  }

  startup();

  vm.editTransactionModal = editTransactionModal;
  function editTransactionModal() {
    // block multiple simultaneous edit
    if (selection.selected.groups.length > 1) {
      Notify.warn('You have multiple transactions selected. Multiple transaction editing is currently disabled');
      return;
    }

    var selectedTransaction = selection.selected.groups[0];
    var transactionUuid = lookupIntermediateRecordUuid(selectedTransaction);

    // Journal module rules for optimistic updating:
    // 1. If a row in the current dataset has been removed - remove this row
    // 2. If a row in the current dataset has been updated - update the values
    // 3. If a row has been added in the edit session it will be ignored as we cannot know if it fits the current filter
    // 4. A dismissable alert will always be shown to the user reminding them their data may be out of date
    Journal.openTransactionEditModal(transactionUuid, false)
      .then(function (editSessionResult) {
        var updatedRows = editSessionResult.updatedTransaction;
        var changed = angular.isDefined(updatedRows);

        vm.gridApi.selection.clearSelectedRows();
        if (changed) {
          // update only rows that already existed and have been edited
          editSessionResult.edited.forEach(function (uuid) {
            // update record that already exists
            var currentRow = journalStore.get(uuid);
            var updatedRow = editSessionResult.updatedTransaction.get(uuid);

            Object.keys(currentRow).forEach(function (key) {
              currentRow[key] = updatedRow[key];
            });
          });

          // remove rows that existed before and have been removed
          editSessionResult.removed.forEach(function (uuid) {
            journalStore.remove(uuid);
          });

          if (editSessionResult.added.length) {
            // rows have been added, we have no guarantees on filters so display a warning
            vm.unknownTransactionEditState = true;
          }
          vm.gridApi.grid.notifyDataChange(uiGridConstants.dataChange.ALL);
        }
      });
  }

  // TODO(@jniles) rename this method and migrate all code to it
  // looks up the Record UUID from a Transaction ID
  function lookupIntermediateRecordUuid(transID) {
    return transactionIdToRecordUuidMap[transID];
  }
}
