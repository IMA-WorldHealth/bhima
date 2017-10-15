angular.module('bhima.services')
  .service('PurchaseOrderService', PurchaseOrderService);

PurchaseOrderService.$inject = [
  '$http', 'util', '$uibModal', 'FilterService', 'appcache', 'PeriodService',
  'PrototypeApiService', '$httpParamSerializer', 'LanguageService',
  'bhConstants',
];

/**
 * @class PurchaseOrderService
 * @extends PrototypeApiService
 *
 * @description
 * Connects client controllers with the purchase order backend.
 */
function PurchaseOrderService(
  $http, util, $uibModal, Filters, AppCache, Periods, Api, $httpParamSerializer,
  Languages, bhConstants
) {
  var baseUrl = '/purchases/';
  var service = new Api(baseUrl);

  var purchaseFilters = new Filters();
  var filterCache = new AppCache('purchases-filters');

  service.filters = purchaseFilters;
  service.openSearchModal = openSearchModal;

  // document exposition definition
  service.download = download;

  // bind public methods to the instance
  service.create = create;
  service.stockStatus = stockStatus;
  service.stockBalance = stockBalance;
  service.purchaseState = purchaseState;

  purchaseFilters.registerDefaultFilters(bhConstants.defaultFilters);

  purchaseFilters.registerCustomFilters([
    { key : 'reference', label : 'FORM.LABELS.REFERENCE' },
    { key : 'user_id', label : 'FORM.LABELS.USER' },
    { key : 'supplier_uuid', label : 'FORM.LABELS.SUPPLIER' },
    { key : 'status_id', label : 'PURCHASES.ORDER' },
    { key : 'defaultPeriod', label : 'TABLE.COLUMNS.PERIOD', ngFilter : 'translate' },
  ]);

  if (filterCache.filters) {
    purchaseFilters.loadCache(filterCache.filters);
  }

  // once the cache has been loaded - ensure that default filters are provided appropriate values
  assignDefaultFilters();

  function assignDefaultFilters() {
    // get the keys of filters already assigned - on initial load this will be empty
    var assignedKeys = Object.keys(purchaseFilters.formatHTTP());

    // assign default period filter
    var periodDefined =
      service.util.arrayIncludes(assignedKeys, ['period', 'custom_period_start', 'custom_period_end']);

    if (!periodDefined) {
      purchaseFilters.assignFilters(Periods.defaultFilters());
    }

    // assign default limit filter
    if (assignedKeys.indexOf('limit') === -1) {
      purchaseFilters.assignFilter('limit', 100);
    }
  }

  service.removeFilter = function removeFilter(key) {
    purchaseFilters.resetFilterState(key);
  };

  // load filters from cache
  service.cacheFilters = function cacheFilters() {
    filterCache.filters = purchaseFilters.formatCache();
  };

  service.loadCachedFilters = function loadCachedFilters() {
    purchaseFilters.loadCache(filterCache.filters || {});
  };

  /**
   * @method create
   *
   * @description
   * Preprocesses purchase order data for submission to the server
   */
  function create(data) {
    // loop through the items ensuring that they are properly formatted for
    // inserting into the database.  We only want to send minimal information
    // to the server.
    // Technically, this filtering is also done on the server, but this reduces
    // bandwidth required for the POST request.
    data.items = data.items.map(function (item) {
      delete item._initialised;
      delete item._invalid;
      delete item._valid;
      delete item.code;
      delete item.description;
      delete item.unit;
      return item;
    });

    return Api.create.call(service, data);
  }

  function stockStatus(id) {
    var url = ''.concat(id, '/stock_status');
    return Api.read.call(service, url);
  }

  function stockBalance(id) {
    var url = ''.concat(id, '/stock_balance');
    return Api.read.call(service, url);
  }

  function purchaseState() {
    var url = ''.concat('purchaseState');
    return Api.read.call(service, url);
  }

  /**
   * @method openSearchModal
   *
   * @param {Object} params - an object of filter parameters to be passed to
   *   the modal.
   * @returns {Promise} modalInstance
   */
  function openSearchModal(params) {
    return $uibModal.open({
      templateUrl : 'modules/purchases/modals/search.tmpl.html',
      size : 'md',
      keyboard : false,
      animation : false,
      backdrop : 'static',
      controller : 'SearchPurchaseOrderModalController as $ctrl',
      resolve : {
        params : function paramsProvider() { return params; },
      },
    }).result;
  }

  function download(type) {
    var filterOpts = purchaseFilters.formatHTTP();
    var defaultOpts = { renderer : type, lang : Languages.key };

    // combine options
    var options = angular.merge(defaultOpts, filterOpts);

    // return  serialized options
    return $httpParamSerializer(options);
  }

  return service;
}
