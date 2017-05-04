angular.module('bhima.controllers')
.controller('JournalController', JournalController);

JournalController.$inject = [
  'JournalService', 'GridSortingService', 'GridGroupingService',
  'GridFilteringService', 'GridColumnService', 'JournalConfigService',
  'SessionService', 'NotifyService', 'TransactionService', 'GridEditorService',
  'bhConstants', '$state', 'uiGridConstants', 'ModalService', 'LanguageService',
  'AppCache', 'Store', 'uiGridGroupingConstants', 'ExportService', 'FindEntityService',
  'FilterService', '$rootScope', '$filter', '$translate'
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
  Filtering, Columns, Config, Session, Notify, Transactions, Editors,
  bhConstants, $state, uiGridConstants, Modal, Languages, AppCache, Store,
  uiGridGroupingConstants, Export, FindEntity, Filters, $rootScope, $filter, $translate) {

  // Journal utilities
  var sorting;
  var grouping;
  var filtering;
  var columnConfig;
  var transactions;

  var filter = new Filters();

  /** @const the cache alias for this controller */
  var cacheKey = 'Journal';

  // top level cache
  var cache = AppCache(cacheKey + '-module');
  var vm = this;
  vm.filter = filter;

  // number of all of the transactions in the system
  Journal.count()
    .then(function (data) {
      vm.numberTotalSystemTransactions = data[0].number_transactions;
    })
    .catch(function (error) {
      Notify.handleError(error);
    });

  /** @constants */
  vm.ROW_EDIT_FLAG = bhConstants.transactions.ROW_EDIT_FLAG;
  vm.ROW_HIGHLIGHT_FLAG = bhConstants.transactions.ROW_HIGHLIGHT_FLAG;
  vm.ROW_INVALID_FLAG = bhConstants.transactions.ROW_INVALID_FLAG;

  // @todo - this doesn't work with the ui-grid-datepicker-edit library yet.
  vm.DATEPICKER_OPTIONS = { format: bhConstants.dates.format };

  vm.enterprise = Session.enterprise;

  // gridOptions is bound to the UI Grid and used to configure many of the
  // options, it is also used by the grid to expose the API
  vm.gridOptions = {
    enableColumnMenus          : false,
    showColumnFooter           : true,
    appScopeProvider           : vm,
    flatEntityAccess           : true,
    enableGroupHeaderSelection : true,
    enableRowHeaderSelection   : true,
    rowTemplate                : '/modules/templates/grid/transaction.row.html'
  };

  vm.grouped = angular.isDefined(cache.grouped) ? cache.grouped : false;

  // Initialise each of the journal utilities, providing them access to the journal
  // configuration options
  sorting = new Sorting(vm.gridOptions);
  filtering = new Filtering(vm.gridOptions, cacheKey);
  grouping = new Grouping(vm.gridOptions, true, 'trans_id', vm.grouped, false);
  columnConfig = new Columns(vm.gridOptions, cacheKey);
  transactions = new Transactions(vm.gridOptions);

  // attaching the filtering object to the view
  vm.filtering = filtering;

  // attaching the grouping object to the view
  vm.grouping = grouping;

  // Attaching the transaction to the view
  vm.transactions = transactions;

  vm.onRemoveFilter = onRemoveFilter;

  vm.cancelEdit = cancelEdit;

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
      visible          : false,
      enableCellEdit   : false },

    { field            : 'project_name',
      displayName      : 'TABLE.COLUMNS.PROJECT',
      headerCellFilter : 'translate',
      visible          : false,
      enableCellEdit   : false },

    { field            : 'period_end',
      displayName      : 'TABLE.COLUMNS.PERIOD',
      headerCellFilter : 'translate' ,
      cellTemplate     : 'modules/templates/bhPeriod.tmpl.html',
      visible          : false,
      enableCellEdit   : false },

    { field            : 'trans_id',
      displayName      : 'TABLE.COLUMNS.TRANSACTION',
      headerCellFilter : 'translate',
      sortingAlgorithm : sorting.transactionIds,
      enableCellEdit   : false,
      width            : 110,
      cellTemplate     : 'modules/journal/templates/hide-groups-label.cell.html' },

    { field                            : 'trans_date',
      displayName                      : 'TABLE.COLUMNS.DATE',
      headerCellFilter                 : 'translate',
      cellFilter                       : 'date:"' + bhConstants.dates.format + '"',
      filter                           : { condition: filtering.filterByDate },
      editableCellTemplate             : 'modules/journal/templates/date.edit.html',
      treeAggregationType              : uiGridGroupingConstants.aggregation.MIN,
      customTreeAggregationFinalizerFn : function (aggregation) {
        aggregation.rendered = $filter('date')(aggregation.value, bhConstants.dates.format);
      },
      enableCellEdit     : true,
      footerCellTemplate : '<i></i>' },

    { field                : 'hrRecord',
      displayName          : 'TABLE.COLUMNS.RECORD',
      headerCellFilter     : 'translate',
      visible              : true,
      treeAggregationType  : uiGridGroupingConstants.aggregation.MIN,
      treeAggregationLabel : '',
      enableCellEdit       : false,
      footerCellTemplate   : '<i></i>' },

    { field              : 'description',
      displayName        : 'TABLE.COLUMNS.DESCRIPTION',
      headerCellFilter   : 'translate',
      footerCellTemplate : '<i></i>' },

    { field                : 'account_number',
      displayName          : 'TABLE.COLUMNS.ACCOUNT',
      editableCellTemplate : '<div><form name="inputForm"><div ui-grid-edit-account></div></form></div>',
      enableCellEdit       : true,
      headerCellFilter     : 'translate',
    }, {
      field                            : 'debit_equiv',
      displayName                      : 'TABLE.COLUMNS.DEBIT',
      headerCellFilter                 : 'translate',
      treeAggregationType              : uiGridGroupingConstants.aggregation.SUM,
      customTreeAggregationFinalizerFn : function (aggregation) {
        aggregation.rendered = aggregation.value;
      },
      enableFiltering : false },

    { field                            : 'credit_equiv',
      displayName                      : 'TABLE.COLUMNS.CREDIT',
      headerCellFilter                 : 'translate',
      treeAggregationType              : uiGridGroupingConstants.aggregation.SUM,
      customTreeAggregationFinalizerFn : function (aggregation) {
        aggregation.rendered = aggregation.value;
      },
      enableFiltering : false },

    { field            : 'currencyName',
      displayName      : 'TABLE.COLUMNS.CURRENCY',
      headerCellFilter : 'translate',
      visible          : false,
      enableCellEdit   : false },

    { field            : 'debit',
      displayName      : 'TABLE.COLUMNS.DEBIT_SOURCE',
      headerCellFilter : 'translate',
      visible          : false,
      cellTemplate     : '/modules/journal/templates/debit.grid.html',
      enableCellEdit   : false },

    { field            : 'credit',
      displayName      : 'TABLE.COLUMNS.CREDIT_SOURCE',
      headerCellFilter : 'translate',
      visible          : false,
      cellTemplate     : '/modules/journal/templates/credit.grid.html',
      enableCellEdit   : false },

    { field                : 'hrEntity',
      displayName          : 'TABLE.COLUMNS.RECIPIENT',
      headerCellFilter     : 'translate',
      editableCellTemplate : '/modules/journal/templates/entity.edit.html',
      visible              : true },

    { field            : 'hrReference',
      displayName      : 'TABLE.COLUMNS.REFERENCE',
      headerCellFilter : 'translate',
      visible          : true },

    { field            : 'display_name',
      displayName      : 'TABLE.COLUMNS.RESPONSIBLE',
      headerCellFilter : 'translate',
      visible          : false,
      enableCellEdit   : false },

    { field            : 'actions',
      displayName      : '',
      headerCellFilter : 'translate',
      visible          : true,
      enableCellEdit   : false,
      cellTemplate     : '/modules/journal/templates/actions.cell.html',
      allowCellFocus   : false,
      enableFiltering  : false,
    },
  ];

  vm.gridOptions.columnDefs = columns;

  // This function opens a modal through column service to let the user show or Hide columns
  vm.openColumnConfigModal = function openColumnConfigModal() {
    columnConfig.openConfigurationModal();
  };

  // This function opens a modal, to let the user posting transaction to the general ledger
  vm.openTrialBalanceModal = function openTrialBalanceModal() {
    var numberSelectedGroup = vm.grouping.getSelectedGroups().length;

    // make sure a row is selected before running the trial balance
    if (numberSelectedGroup === 0) {
      Notify.warn('POSTING_JOURNAL.WARNINGS.NO_TRANSACTIONS_SELECTED');
      return;
    }

    $state.go('trialBalanceMain', { records: vm.grouping.getSelectedGroups() });
  };

  // format Export Parameters
  function formatExportParameters(type) {
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
    var url = '/reports/finance/journal';
    var params = formatExportParameters('csv');

    if (!params) { return; }

    Export.download(url, params, 'POSTING_JOURNAL.TITLE');
  };

  function errorHandler(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  // loads data for the journal
  function load(options) {
    vm.loading = true;
    vm.hasError = false;
    vm.gridOptions.gridFooterTemplate = null;
    vm.gridOptions.showGridFooter = false;

    // number of transactions downloaded and shown in the current journal
    var numberCurrentGridTransactions = 0;

    // @fixme
    Journal.grid(null, options)
      .then(function (records) {
        // To Get the number of transaction
        numberCurrentGridTransactions =  records.aggregate.length;

        // pre process data - this should be done in a more generic way in a service
        vm.gridOptions.data = transactions.preprocessJournalData(records);
        vm.gridOptions.showGridFooter = true;
        vm.gridOptions.gridFooterTemplate = '<div><strong>' + $translate.instant('FORM.INFO.NUM_TRANSACTION') +
          ' : ' + numberCurrentGridTransactions + ' / ' + vm.numberTotalSystemTransactions + '</strong></div>';
        transactions.applyEdits();

        // try to unfold groups
        // try { grouping.unfoldAllGroups(); } catch (e) {}
      })
      .catch(errorHandler)
      .finally(toggleLoadingIndicator);
  }

  // this method can eventually ensure we have a flat direct binding to all
  // cells in UI grid. This should drastically improve performance
  // @todo move this method into a service
  function preprocessJournalData(data) {
    var aggregateStore = new Store({ identifier: 'record_uuid' });
    aggregateStore.setData(data.aggregate);

    data.journal.forEach(function (row) {

      // give each row a reference to its transaction aggregate data
      row.transaction = aggregateStore.get(row.record_uuid);
    });

    return data.journal;
  }

  // open search modal
  vm.openSearchModal = function openSearchModal() {
    var filtersSnapshot = Journal.filters.formatHTTP();

    Config.openSearchModal(filtersSnapshot)
      .then(function (changes) {

        Journal.filters.replaceFilters(changes);

        Journal.cacheFilters();
        vm.latestViewFilters = Journal.filters.formatView();

        toggleLoadingIndicator();
        return load(Journal.filters.formatHTTP(true));
      })
      .catch(angular.noop);
  };

  // remove a filter with from the filter object, save the filters and reload
  function onRemoveFilter(key) {
    Journal.removeFilter(key);

    Journal.cacheFilters();
    vm.latestViewFilters = Journal.filters.formatView();

    return load(Journal.filters.formatHTTP(true));
  }

  vm.editTransaction = editTransaction;
  function editTransaction(row) {
    vm.filterBarHeight = bhConstants.utilBar.journalHeightStyle;

    // expand the row
    vm.grouping.unfoldGroup(row);

    transactions.edit(row);

    // disable inline filtering when editing
    filtering.disableInlineFiltering();
  }

  vm.saveTransaction = saveTransaction;
  function saveTransaction() {
    vm.filterBarHeight = bhConstants.utilBar.collapsedHeightStyle;
    transactions.save()
      .then(function (results) {
        Notify.success('POSTING_JOURNAL.SAVE_TRANSACTION_SUCCESS');
        // ensure that all of the data now respects the current filter
        load(vm.filters);
      })
      .catch(function (error) {
        if (!error.status) {
          Notify.warn(error);
        } else {
          Notify.handleError(error);
        }
      });
  }

  vm.toggleTransactionGroup = function toggleTransactionGroup() {
    if (vm.grouping.getCurrentGroupingColumn()) {
      // alias for template speed/ convenience
      vm.grouping.removeGrouping('trans_id');
      vm.grouped = cache.grouped = false;
    } else {
      vm.grouping.changeGrouping('trans_id');
      vm.grouped = cache.grouped = true;
    }
  };

  vm.saveAccountEdit = function saveAcconutEdit(row, account) {
    row.account_id = account.id;
    row.account_name = account.hrlabel;
    $rootScope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
  };

  function cancelEdit() {
    vm.filterBarHeight = bhConstants.utilBar.collapsedHeightStyle;

    // @TODO this should return a promise in a uniform standard with `saveTransaction`
    transactions.cancel();

    // ensure data that has been changed is up to date from the server
    // remove any additional or temporary rows
    load(Journal.filters.formatHTTP(true));
  }

  // runs on startup
  function startup() {
    load(Journal.filters.formatHTTP(true));
    vm.latestViewFilters = Journal.filters.formatView();
  }

  // ===================== edit entity ===============================

  // expose to the view
  vm.openEntityModal = openEntityModal;
  vm.removeEntity = removeEntity;

  // open find entity modal
  function openEntityModal(row) {
    FindEntity.openModal()
      .then(function (entity) {
        if (!entity) { return; }

        row.hrEntity = entity.hrEntity;
        transactions.editCell(row, 'entity_uuid', entity.uuid);
      });
  }

  // remove the entity
  function removeEntity(row) {
    if (!row.hrEntity) { return; }

    transactions.editCell(row, 'entity_uuid', null);
    delete row.entity_uuid;
    delete row.hrEntity;
  }

  // ===================== end edit entity ===========================
  startup();
}
