angular.module('bhima.services')
  .service('AccountStatementService', AccountStatementService);

AccountStatementService.$inject = [
  '$uibModal', '$http', 'util', 'AppCache', 'FilterService', 'PeriodService',
  'bhConstants',
];

/**
 * @overview AccountStatementService
 *
 * @description
 * This service powers the backend for the Account Statement report, giving an
 * overview of all accounts by period for the entire fiscal year.
 */
function AccountStatementService(Modal, $http, util, AppCache, Filters, Periods, bhConstants) {
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
    return $http.put(baseUrl.concat('comments'), { params : params })
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
        modalParameters :  function dataProvider() { return request; },
      },
    };
    var instance = Modal.open(params);
    return instance.result;
  }

  // bind cache methods
  service.removeFilter = removeFilter;
  service.cacheFilters = cacheFilters;
  service.loadCachedFilters = loadCachedFilters;

  // default filters will always be applied
  accountStatementFilters.registerDefaultFilters(bhConstants.defaultFilters);
  accountStatementFilters.registerDefaultFilters([
    { key : 'account_id', label : 'TABLE.COLUMNS.ACCOUNT' },
  ]);

  // custom filters can be optionally applied
  accountStatementFilters.registerCustomFilters([
    { key : 'trans_id', label : 'FORM.LABELS.TRANS_ID' },
    { key : 'reference', label : 'FORM.LABELS.REFERENCE' },
    { key : 'user_id', label : 'FORM.LABELS.USER' },
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
