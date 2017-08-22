angular.module('bhima.services')
  .service('VoucherService', VoucherService);

VoucherService.$inject = [
  'PrototypeApiService', '$http', 'TransactionTypeStoreService', '$uibModal', 'FilterService',
   'PeriodService', 'LanguageService', '$httpParamSerializer', 'appcache',
];

/**
 * @class VoucherService
 * @extends PrototypeApiService
 *
 * @description
 * This service manages posting data to the database via the /vouchers/ URL.  It also
 * includes some utilities that are useful for voucher pages.
 */
function VoucherService(Api, $http, TransactionTypeStore, Modal,
  Filters, Periods, Languages, $httpParamSerializer, AppCache) {
  var service = new Api('/vouchers/');
  var voucherFilters = new Filters();
  var filterCache = new AppCache('voucher-filters');

  // @todo - remove this reference to baseUrl
  var baseUrl = '/journal/';

  service.create = create;
  service.reverse = reverse;
  service.transactionType = transactionType;
  service.openSearchModal = openSearchModal;

  // service.formatFilterParameters = formatFilterParameters;
  service.filters = voucherFilters;
  service.cacheFilters = cacheFilters;
  service.removeFilter = removeFilter;
  service.loadCachedFilters = loadCachedFilters;
  service.download = download;

  voucherFilters.registerDefaultFilters([
    { key : 'period', label : 'TABLE.COLUMNS.PERIOD', valueFilter : 'translate' },
    { key : 'custom_period_start', label : 'PERIODS.START', comparitor : '>', valueFilter : 'date' },
    { key : 'custom_period_end', label : 'PERIODS.END', comparitor : '<', valueFilter : 'date' },
    { key : 'limit', label : 'FORM.LABELS.LIMIT' }]);

  voucherFilters.registerCustomFilters([
    { key : 'user_id', label : 'FORM.LABELS.USER' },
    { key : 'reference', label : 'FORM.LABELS.REFERENCE' },
    { key : 'reversed', label : 'FORM.INFO.ANNULLED' },
    { key : 'description', label : 'FORM.LABELS.DESCRIPTION' },
    { key : 'entity_uuid', label : 'FORM.LABELS.ENTITY' },
    { key : 'type_ids', label : 'FORM.LABELS.TRANSACTION_TYPE' }]);


  if (filterCache.filters) {
    voucherFilters.loadCache(filterCache.filters);
  }

  // once the cache has been loaded - ensure that default filters are provided appropriate values
  assignDefaultFilters();

  function assignDefaultFilters() {
    // get the keys of filters already assigned - on initial load this will be empty
    var assignedKeys = Object.keys(voucherFilters.formatHTTP());

    // assign default period filter
    var periodDefined =
      service.util.arrayIncludes(assignedKeys, ['period', 'custom_period_start', 'custom_period_end']);

    if (!periodDefined) {
      voucherFilters.assignFilters(Periods.defaultFilters());
    }

    // assign default limit filter
    if (assignedKeys.indexOf('limit') === -1) {
      voucherFilters.assignFilter('limit', 100);
    }
  }

  function removeFilter(key) {
    voucherFilters.resetFilterState(key);
  }

  // load filters from cache
  function cacheFilters() {
    filterCache.filters = voucherFilters.formatCache();
  }

  function loadCachedFilters() {
    voucherFilters.loadCache(filterCache.filters || {});
  }

  // returns true if the key starts with an underscore
  function isInternalKey(key) {
    return key[0] === '_' || key[0] === '$';
  }

  // strips internal keys from object
  function stripInternalObjectKeys(object) {
    var o = {};

    angular.forEach(object, function (value, key) {
      if (!isInternalKey(key)) {
        o[key] = value;
      }
    });

    return o;
  }

  /**
   * Wraps the prototype create method.
   */
  function create(voucher) {
    var v = angular.copy(voucher);

    // format items for posting, removing validation keys and unlinking old objects
    v.items = v.items.map(function (item) {
      var escapedItem = stripInternalObjectKeys(item);

      if (escapedItem.entity) {
        escapedItem.entity_uuid = escapedItem.entity.uuid;
      }

      if (escapedItem.document) {
        escapedItem.document_uuid = escapedItem.document.uuid;
      }

      return escapedItem;
    });

    // we pick either the debit or the credit side to assign as the total amount
    // of the voucher
    v.amount = v.items.reduce(function (sum, row) {
      return sum + row.debit;
    }, 0);

    return Api.create.call(service, { voucher : v });
  }

  /**
   * This method facilitate annulling a transaction,
   * bhima should automatically be able to reverse
   * any transaction in the posting_journal by creating a
   * new transaction that is an exact duplicate of the original transaction with the
   * debits and credits switched.
   */
  function reverse(creditNote) {
    return $http.post(baseUrl.concat(creditNote.uuid, '/reverse'), creditNote)
      .then(service.util.unwrapHttpResponse);
  }

  /**
   * @function transactionType
   * @description return transaction type store object
   * @return {object} Store transaction type store object { data: array, ...}
   */
  function transactionType() {
    return TransactionTypeStore.load();
  }

  // downloads a type of report based on the
  function download(type) {
    var filterOpts = voucherFilters.formatHTTP();
    var defaultOpts = { renderer : type, lang : Languages.key };

    // combine options
    var options = angular.merge(defaultOpts, filterOpts);

    // return  serialized options
    return $httpParamSerializer(options);
  }

  /**
   * @function openSearchModal
   * @description
   * This functions opens the search modal form for the voucher registry.
   */
  function openSearchModal(filters) {
    return Modal.open({
      templateUrl : 'modules/vouchers/modals/search.modal.html',
      size        : 'md',
      animation   : false,
      keyboard    : false,
      backdrop    : 'static',
      controller  : 'VoucherRegistrySearchModalController as $ctrl',
      resolve     : {
        filters : function filtersProvider() { return filters; },
      },
    }).result;
  }

  return service;
}
