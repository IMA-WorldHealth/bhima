angular.module('bhima.services')
  .service('JournalService', JournalService);

// Dependencies injection
JournalService.$inject = ['$log', 'PrototypeApiService', 'AppCache', 'FilterService', 'PeriodService'];

/**
 * Journal Service
 * This service is responsible of all process with the posting journal
 */
function JournalService($log, Api, AppCache, Filters, Periods) {
  var URL = '/journal/';
  var service = new Api(URL);


  service.formatFilterParameters = formatFilterParameters;
  service.grid = grid;
  service.saveChanges = saveChanges;

  /**
   * Standard API read method, as this will be used to drive the journal grids
   * this method will always request aggregate information
   */
  function grid(id, parameters) {
    var gridOptions = angular.extend({ aggregates : 1 }, parameters);
    return this.read(id, gridOptions);
  }

  function saveChanges(entity, changes) {
    var added = angular.copy(entity.newRows);

    // format request for server
    var saveRequest = {
      changed : changes,
      added   : sanitiseNewRows(added),
      removed : entity.removedRows,
    };

    return service.$http.post('/journal/'.concat(entity.uuid, '/edit'), saveRequest)
      .then(service.util.unwrapHttpRequest);
  }

  function sanitiseNewRows(rows) {
    rows.data.forEach(function (row) {
      // delete view data required by journal grid
      delete row.transaction;
      delete row.hrRecord;
      delete row.currencyName;
      delete row.project_name;
    });

    return rows.data;
  }

  // set up base filters
  var filterCache = new AppCache('journal-filters');
  var journalFilters = new Filters();

  service.filters = journalFilters;

  $log.debug('[JournalService] Created filter list:', journalFilters);


  // @TODO Areas to clean up/ abstract with custom filters:
  //       1. ensuring that both period and custom_period is not assigned is the responsibility of the entity service
  //       2. custom periods are not handled by the filter parser `period` method
  var periodFilters = ['period', 'custom_period_start', 'custom_period_end'];

  // default filtes will always be applied
  journalFilters.registerDefaultFilters([
      { key : 'period', label : 'TABLE.COLUMNS.PERIOD', valueFilter : 'translate' },
      { key : 'custom_period_start', label : 'TABLE.COLUMNS.PERIOD_START', valueFilter : 'date' },
      { key : 'custom_period_end', label : 'TABLE.COLUMNS.PERIOD_END', valueFilter : 'date' }]);
      // { key : 'transactions', label : 'FORM.LABELS.TRANSACTIONS', defaultValue : true },
      // { key : 'limit', label : 'FORM.LABELS.LIMIT' }]);

  // custom filters can be optionally applied
  journalFilters.registerCustomFilters([
      { key: 'trans_id', label: 'FORM.LABELS.TRANS_ID' },
      { key: 'reference', label: 'FORM.LABELS.REFERENCE' },
      { key: 'user_id', label: 'FORM.LABELS.USER' },
      { key: 'account_id', label: 'FORM.LABELS.ACCOUNT' },
      { key: 'amount', label: 'FORM.LABELS.AMOUNT' },
      { key: 'project_id', label: 'FORM.LABELS.PROJECT' },
      { key: 'description', label: 'FORM.LABELS.DESCRIPTION' }]);

  // configure module defaults
  if (filterCache.filters) {
    // load cached filter definition if it exists
    journalFilters.loadCache(filterCache.filters);
  }

  // once the cache has been loaded - ensure that default filters are provided appropriate values
  assignDefaultFilters();

  function assignDefaultFilters() {
    // get the keys of filters already assigned - on initial load this will be empty
    var assignedKeys = Object.keys(journalFilters.formatHTTP());

    var periodDefined = service.util.arrayIncludes(assignedKeys, ['period', 'custom_period_start', 'custom_period_end']);
    if (!periodDefined) {
      journalFilters.assignFilters(Periods.defaultFilters());
    }
    // if (assignedKeys.indexOf('limit') === -1) {
  }

  service.removeFilter = function removeFilter(key) {
    journalFilters.resetFilterState(key);
  }

  // load filters from cache
  service.cacheFilters = function cacheFilters() {
    filterCache.filters = journalFilters.formatCache();
  }

  service.loadCachedFilters = function loadCachedFilters() {
    journalFilters.loadCache(filterCache.filters || {});
  }

  // expose methods for search configuration

  // expose methods for applying filters to search query

  // expose methods for force clearing filters cache

  /**
   * This function prepares the filters for the journal for display to the
   * client via the bhFiltersApplied directive.
   * @todo - this might be better in it's own service
   */
  function formatFilterParameters(params) {
    var columns = [
      { field: 'debit', displayName: 'FORM.LABELS.DEBIT' },
      { field: 'credit', displayName: 'FORM.LABELS.CREDIT' },
      { field: 'credit_equiv', displayName: 'FORM.LABELS.CREDIT' },
      { field: 'debit_equiv', displayName: 'FORM.LABELS.DEBIT' },
      { field: 'trans_id', displayName: 'FORM.LABELS.TRANS_ID' },
      { field: 'reference', displayName: 'FORM.LABELS.REFERENCE' },
      { field: 'user_id', displayName: 'FORM.LABELS.USER' },
      { field: 'account_id', displayName: 'FORM.LABELS.ACCOUNT' },
      { field: 'description', displayName: 'FORM.LABELS.DESCRIPTION', truncate: 8 },
      { field: 'dateFrom', displayName: 'FORM.LABELS.DATE', comparitor: '>', ngFilter: 'date' },
      { field: 'dateTo', displayName: 'FORM.LABELS.DATE', comparitor: '<', ngFilter: 'date' },
      { field: 'amount', displayName: 'FORM.LABELS.AMOUNT' },
      { field: 'project_id', displayName: 'FORM.LABELS.PROJECT' },
    ];

    // returns columns from filters
    return columns.filter(function (column) {
      var value = params[column.field];

      if (angular.isDefined(value)) {

        // this is to temporarily reduce the size of the description field
        // @TODO - find a better way of doing this
        if (column.truncate) {
          column.value = String(value).substring(0, column.truncate) + '... ';
        } else {
          column.value = value;
        }

        return true;
      } else {
        return false;
      }
    });
  }

  return service;
}
