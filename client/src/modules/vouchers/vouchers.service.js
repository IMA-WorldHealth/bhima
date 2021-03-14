angular.module('bhima.services')
  .service('VoucherService', VoucherService);

VoucherService.$inject = [
  'PrototypeApiService', 'TransactionTypeStoreService', '$uibModal',
  'FilterService', 'PeriodService', 'LanguageService', '$httpParamSerializer',
  'appcache', 'bhConstants', 'TransactionService', '$translate',
];

/**
 * @class VoucherService
 * @extends PrototypeApiService
 *
 * @description
 * This service manages posting data to the database via the /vouchers/ URL.  It also
 * includes some utilities that are useful for voucher pages.
 */
function VoucherService(
  Api, TransactionTypeStore, Modal, Filters, Periods, Languages,
  $httpParamSerializer, AppCache, bhConstants, Transactions, $translate,
) {
  const service = new Api('/vouchers/');
  const voucherFilters = new Filters();
  const filterCache = new AppCache('voucher-filters');

  // @todo - remove this reference to baseUrl
  const baseUrl = '/journal/';

  service.create = create;
  service.reverse = reverse;
  service.remove = Transactions.remove;
  service.transactionType = transactionType;
  service.openSearchModal = openSearchModal;
  service.openReverseRecordModal = openReverseRecordModal;

  service.filters = voucherFilters;
  service.cacheFilters = cacheFilters;
  service.removeFilter = removeFilter;
  service.loadCachedFilters = loadCachedFilters;
  service.download = download;

  service.groupTransactionByType = groupTransactionByType;

  voucherFilters.registerDefaultFilters(bhConstants.defaultFilters);

  voucherFilters.registerCustomFilters([
    { key : 'uuid', label : 'FORM.LABELS.REFERENCE' },
    { key : 'user_id', label : 'FORM.LABELS.USER' },
    { key : 'reference', label : 'FORM.LABELS.REFERENCE' },
    { key : 'reversed', label : 'VOUCHERS.GLOBAL.REVERSED_RECORDS' },
    { key : 'description', label : 'FORM.LABELS.DESCRIPTION' },
    { key : 'entity_uuid', label : 'FORM.LABELS.ENTITY' },
    { key : 'account_id', label : 'FORM.LABELS.ACCOUNT' },
    { key : 'cash_uuid', label : 'FORM.INFO.PAYMENT' },
    { key : 'invoice_uuid', label : 'FORM.LABELS.INVOICE' },
    { key : 'type_ids', label : 'FORM.LABELS.TRANSACTION_TYPE' },
    { key : 'project_id', label : 'FORM.LABELS.PROJECT' },
    { key : 'currency_id', label : 'FORM.LABELS.CURRENCY' },
    { key : 'stockReference', label : 'FORM.LABELS.REFERENCE_STOCK_MOVEMENT' },
  ]);

  if (filterCache.filters) {
    voucherFilters.loadCache(filterCache.filters);
  }

  // once the cache has been loaded - ensure that default filters are provided appropriate values
  assignDefaultFilters();

  function assignDefaultFilters() {
    // get the keys of filters already assigned - on initial load this will be empty
    const assignedKeys = Object.keys(voucherFilters.formatHTTP());

    // assign default period filter
    const periodKeys = ['period', 'custom_period_start', 'custom_period_end'];
    const periodDefined = service.util.arrayIncludes(assignedKeys, periodKeys);

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
    const o = {};

    angular.forEach(object, (value, key) => {
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
    const v = angular.copy(voucher);

    // format items for posting, removing validation keys and unlinking old objects
    v.items = v.items.map((item) => {
      const escapedItem = stripInternalObjectKeys(item);

      if (escapedItem.entity) {
        escapedItem.entity_uuid = escapedItem.entity.uuid;
      }

      if (escapedItem.document) {
        escapedItem.document_uuid = escapedItem.document.uuid;
      }

      return escapedItem;
    });

    // @FIXME(sfount) this uses javascript maths without using something like the
    //                BigNumber library. Our general default is to do maths in MySQL
    // we pick either the debit or the credit side to assign as the total amount
    // of the voucher
    v.amount = v.items.reduce((sum, row) => {
      return sum + row.debit;
    }, 0);

    return Api.create.call(service, { voucher : v });
  }

  /**
   * @method reverse
   *
   * @description
   * This method reverses a transaction.
   * bhima should automatically be able to reverse any transaction in the
   * posting_journal by creating a new transaction that is an exact duplicate of
   * the original transaction with the debits and credits switched.
   */
  function reverse(record) {
    return service.$http.post(baseUrl.concat(record.uuid, '/reverse'), record)
      .then(service.util.unwrapHttpResponse);
  }

  /**
   * @function transactionType
   * @description return transaction type store object
   * @return {object} Store transaction type store object { data: array, ...}
   */
  function transactionType() {
    return TransactionTypeStore.load()
      .then((transactionTypes) => {
        return transactionTypes.data.map((item) => {
          item.hrText = $translate.instant(item.text);
          return item;
        });
      });
  }

  // downloads a type of report based on the
  function download(type) {
    const filterOpts = voucherFilters.formatHTTP();
    const defaultOpts = { renderer : type, lang : Languages.key };

    // combine options
    const options = angular.merge(defaultOpts, filterOpts);

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
      size : 'md',
      controller : 'VoucherRegistrySearchModalController as $ctrl',
      resolve : {
        filters : () => filters,
      },
    }).result;
  }

  function openReverseRecordModal(uuid) {
    return Modal.open({
      templateUrl : 'modules/vouchers/modals/reverse-voucher.modal.html',
      resolve     : { data : { uuid } },
      size        : 'md',
      controller  : 'ReverseVoucherModalController as ModalCtrl',
    }).result;
  }

  function groupTransactionByType(item) {
    const type = bhConstants.transactionTypeMap[item.type];
    return $translate.instant(type.label);
  }

  return service;
}
