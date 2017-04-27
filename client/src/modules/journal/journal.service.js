angular.module('bhima.services')
  .service('JournalService', JournalService);

// Dependencies injection
JournalService.$inject = ['PrototypeApiService', 'AppCache', 'FilterService', 'PeriodService'];

/**
 * Journal Service
 * This service is responsible of all process with the posting journal
 */
function JournalService(Api, AppCache, Filters, Periods) {
  var URL = '/journal/';
  var service = new Api(URL);

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

  // default filtes will always be applied
  journalFilters.registerDefaultFilters([
      { key : 'period', label : 'TABLE.COLUMNS.PERIOD', valueFilter : 'translate' },
      { key : 'custom_period_start', label : 'PERIODS.START', valueFilter : 'date' },
      { key : 'custom_period_end', label : 'PERIODS.END', valueFilter : 'date' },
      { key : 'limit', label : 'FORM.LABELS.LIMIT' }]);
      // { key : 'transactions', label : 'FORM.LABELS.TRANSACTIONS', defaultValue : true },

  // custom filters can be optionally applied
  journalFilters.registerCustomFilters([
      { key: 'trans_id', label: 'FORM.LABELS.TRANS_ID' },
      { key: 'reference', label: 'FORM.LABELS.REFERENCE' },
      { key: 'user_id', label: 'FORM.LABELS.USER' },
      { key: 'account_id', label: 'FORM.LABELS.ACCOUNT' },
      { key: 'amount', label: 'FORM.LABELS.AMOUNT' },
      { key: 'project_id', label: 'FORM.LABELS.PROJECT' },
      { key: 'description', label: 'FORM.LABELS.DESCRIPTION' },
      { key: 'origin_id', label: 'FORM.LABELS.TRANSACTION_TYPE' }]);


  if (filterCache.filters) {
    // load cached filter definition if it exists
    journalFilters.loadCache(filterCache.filters);
  }

  // once the cache has been loaded - ensure that default filters are provided appropriate values
  assignDefaultFilters();

  function assignDefaultFilters() {
    // get the keys of filters already assigned - on initial load this will be empty
    var assignedKeys = Object.keys(journalFilters.formatHTTP());

    // assign default period filter
    var periodDefined = service.util.arrayIncludes(assignedKeys, ['period', 'custom_period_start', 'custom_period_end']);
    if (!periodDefined) {
      journalFilters.assignFilters(Periods.defaultFilters());
    }

    // assign default limit filter
    if (assignedKeys.indexOf('limit') === -1) {
      journalFilters.assignFilter('limit', 100);
    }
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

  return service;
}
