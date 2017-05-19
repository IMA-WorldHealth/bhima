angular.module('bhima.services')
.service('AccountStatementService', AccountStatementService);

// DI
AccountStatementService.$inject = [
  '$uibModal', '$http', 'util',
  'AppCache', 'FilterService', 'PeriodService',
];

/**
 * AccountStatementService
 */
function AccountStatementService(Modal, $http, util, AppCache, Filters, Periods) {
  var service = this;
  var baseUrl = '/general_ledger/';
  var filterCache = new AppCache('account-statement-filters');
  var accountStatementFilters = new Filters();

  // bind method
  service.filters = accountStatementFilters;
  service.openCommentModal = openCommentModal;
  service.commentAccountStatement = commentAccountStatement;

  /**
   * @method commentAccountStatement
   * @param {object} params - { uuids: An array of uuid, string: comment }
   */
  function commentAccountStatement(params) {
    return $http.put(baseUrl.concat('comment'), { params : params })
      .then(util.unwrapHttpResponse);
  }

  /**
   * @method openCommentModal
   * @param {object} request
   */
  function openCommentModal(request) {
    var params = {
      templateUrl  : 'modules/account_statement/modals/comment.modal.html',
      controller   : 'CommentAccountStatementController',
      controllerAs : '$ctrl',
      size         : 'md',
      backdrop     : 'static',
      resolve : {
        data :  function dataProvider() { return request; },
      },
    };
    var instance = Modal.open(params);
    return instance.result;
  }

  // bind cache methods
  service.removeFilter = removeFilter;
  service.cacheFilters = cacheFilters;
  service.loadCachedFilters = loadCachedFilters;

  // default filtes will always be applied
  accountStatementFilters.registerDefaultFilters([
    { key : 'account_id', label : 'TABLE.COLUMNS.ACCOUNT' },
    { key : 'period', label : 'TABLE.COLUMNS.PERIOD', valueFilter : 'translate' },
    { key : 'custom_period_start', label : 'PERIODS.START', valueFilter : 'date' },
    { key : 'custom_period_end', label : 'PERIODS.END', valueFilter : 'date' },
    { key : 'limit', label : 'FORM.LABELS.LIMIT' }]);

  // custom filters can be optionally applied
  accountStatementFilters.registerCustomFilters([
    { key : 'reference', label : 'FORM.LABELS.REFERENCE' },
    { key : 'user_id', label : 'FORM.LABELS.USER' },
    // { key : 'account_id', label : 'FORM.LABELS.ACCOUNT' },
    { key : 'amount', label : 'FORM.LABELS.AMOUNT' },
    { key : 'project_id', label : 'FORM.LABELS.PROJECT' },
    { key : 'description', label : 'FORM.LABELS.DESCRIPTION' },
    { key : 'origin_id', label : 'FORM.LABELS.TRANSACTION_TYPE' }]);


  if (filterCache.filters) {
    // load cached filter definition if it exists
    accountStatementFilters.loadCache(filterCache.filters);
  }

  // once the cache has been loaded - ensure that default filters are provided appropriate values
  assignDefaultFilters();

  function assignDefaultFilters() {
    // get the keys of filters already assigned - on initial load this will be empty
    var assignedKeys = Object.keys(accountStatementFilters.formatHTTP());

    // assign default period filter
    var periodKeys = ['period', 'custom_period_start', 'custom_period_end'];
    var periodDefined = util.arrayIncludes(assignedKeys, periodKeys);

    if (!periodDefined) {
      accountStatementFilters.assignFilters(Periods.defaultFilters());
    }

    // assign default limit filter
    if (assignedKeys.indexOf('limit') === -1) {
      accountStatementFilters.assignFilter('limit', 100);
    }
  }

  function removeFilter(key) {
    accountStatementFilters.resetFilterState(key);
  }

  function cacheFilters() {
    filterCache.filters = accountStatementFilters.formatCache();
  }

  function loadCachedFilters() {
    accountStatementFilters.loadCache(filterCache.filters || {});
  }
}
