angular.module('bhima.services')
  .service('JournalService', JournalService);

// Dependencies injection
JournalService.$inject = [ 'PrototypeApiService', 'AppCache', 'FilterService', 'PeriodService', '$uibModal'];

/**
 * Journal Service
 * This service is responsible of all process with the posting journal
 */
function JournalService(Api, AppCache, Filters, Periods, Modal) {
  var URL = '/journal/';
  var service = new Api(URL);

  service.grid = grid;
  service.saveChanges = saveChanges;
  service.openSearchModal = openSearchModal;
  service.openCommentModal = openCommentModal;
  service.openTransactionEditModal = openTransactionEditModal;
  service.mapTransactionIdsToRecordUuids = mapTransactionIdsToRecordUuids;
  service.commentPostingJournal = commentPostingJournal;

  /**
   * Standard API read method, as this will be used to drive the journal grids
   * this method will always request aggregate information
   */
  function grid(id, parameters) {
    var gridOptions = angular.extend({ aggregates : 1 }, parameters);
    return this.read(id, gridOptions);
  }

  /**
   * @function mapTransactionIdsToRecordUuids
   *
   * @description
   * Helper method to map transaction ids to record uuids.
   */
  function mapTransactionIdsToRecordUuids(data) {
    return data.reduce(_mapTransactionIdsToRecordUuids, {});
  }

  /**
   * @function _mapTransactionIdsToRecordUuids
   *
   * @description
   * Internal method that is passed to the reduce() function.  It is separated for
   * performance reasons.
   */
  function _mapTransactionIdsToRecordUuids(mapping, row) {
    mapping[row.trans_id] = row.record_uuid;
    return mapping;
  }

  // @TODO(sfount) change this API to (change pending to not break current functionality):
  //                - transaction uuid
  //                - changes (object)
  //                - new rows (array)
  //                - removed rows (array)
  function saveChanges(entity, changes) {
    var added = angular.copy(entity.newRows);

    // format request for server
    var saveRequest = {
      changed : changes,
      added   : sanitiseNewRows(added),
      removed : entity.removedRows,
    };

    return service.$http.post(URL.concat(entity.uuid, '/edit'), saveRequest)
      .then(service.util.unwrapHttpResponse);
  }

  function sanitiseNewRows(rows) {
    rows.data.forEach(function (row) {

      // delete view data required by journal grid
      delete row.transaction;
      delete row.hrRecord;
      delete row.currencyName;
      delete row.project_name;
      delete row.display_name;
      delete row.posted;
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
      { key : 'trans_id', label : 'FORM.LABELS.TRANS_ID' },
      { key : 'record_uuid', label : 'FORM.LABELS.TRANS_ID' },
      { key : 'reference', label : 'FORM.LABELS.REFERENCE' },
      { key : 'user_id', label : 'FORM.LABELS.USER' },
      { key : 'account_id', label : 'FORM.LABELS.ACCOUNT' },
      { key : 'amount', label : 'FORM.LABELS.AMOUNT' },
      { key : 'project_id', label : 'FORM.LABELS.PROJECT' },
      { key : 'description', label : 'FORM.LABELS.DESCRIPTION' },
      { key : 'includeNonPosted', label : 'TRANSACTIONS.INCLUDE_POSTED_TRANSACTIONS_SHORT' },
      { key : 'origin_id', label : 'FORM.LABELS.TRANSACTION_TYPE' }]);

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
    var periodDefined =
      service.util.arrayIncludes(assignedKeys, ['period', 'custom_period_start', 'custom_period_end']);

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
  };

  // load filters from cache
  service.cacheFilters = function cacheFilters() {
    filterCache.filters = journalFilters.formatCache();
  };

  service.loadCachedFilters = function loadCachedFilters() {
    journalFilters.loadCache(filterCache.filters || {});
  };

  /**
   * openSearchModal
   * @param {object} filters
   * @param {object} options - { hasDefaultAccount: true } define other options
   */
  function openSearchModal(filters, options) {
    return Modal.open({
      templateUrl : 'modules/journal/modals/search.modal.html',
      controller :  'JournalSearchModalController as ModalCtrl',
      backdrop : 'static',
      resolve : {
        filters : function () { return filters; },
        options : function () { return options || {}; },
      },
    }).result;
  }

   /**
   * @method openCommentModal
   * @param {object} request
   */
  function openCommentModal(request) {
    var params = {
      templateUrl  : 'modules/account_statement/modals/comment.modal.html',
      controller   : 'CommentJournalController',
      controllerAs : '$ctrl',
      size         : 'md',
      backdrop     : 'static',
      resolve : {
        modalParameters :  function dataProvider() { return request; },
      },
    };
    var instance = Modal.open(params);
    return instance.result;
  }


  // @TODO(sfount) move this to a service that can easily be accessed by any module that will show a transactions details
  function openTransactionEditModal(transactionUuid, readOnly) {
    return Modal.open({
      templateUrl : 'modules/journal/modals/editTransaction.modal.html',
      controller : 'JournalEditTransactionController as ModalCtrl',
      backdrop : 'static',
      keyboard : false,
      size : 'lg',
      resolve : {
        transactionUuid : function () { return transactionUuid; },
        readOnly : function () { return readOnly; },
      },
    }).result;
  }

  // updating the posting journal by adding comments in transactions
  function commentPostingJournal(params) {
    return service.$http.put(URL.concat('comments'), { 'params' : params })
      .then(service.util.unwrapHttpResponse);
  }


  return service;
}
