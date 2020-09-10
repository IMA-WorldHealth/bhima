angular.module('bhima.services')
  .service('StockFilterer', StockFiltererService);

StockFiltererService.$inject = [
  'FilterService', 'appcache', 'PeriodService',
  '$httpParamSerializer', 'LanguageService', 'bhConstants',
];

/**
 * @class StockFilterer
 */
function StockFiltererService(Filters, AppCache, Periods, $httpParamSerializer, Languages, bhConstants) {
  const customFiltersList = [
    { key : 'depot_uuid', label : 'STOCK.DEPOT' },
    { key : 'purchase_uuid', label : 'PURCHASES.ORDER' },
    { key : 'inventory_uuid', label : 'STOCK.INVENTORY' },
    { key : 'invoice_uuid', label : 'FORM.LABELS.INVOICE' },
    { key : 'group_uuid', label : 'STOCK.INVENTORY_GROUP' },
    { key : 'label', label : 'STOCK.LOT' },
    { key : 'is_exit', label : 'STOCK.OUTPUT' },
    { key : 'reference', label : 'FORM.LABELS.REFERENCE' },
    { key : 'flux_id', label : 'STOCK.FLUX' },
    { key : 'user_id', label : 'FORM.LABELS.USER' },
    { key : 'status', label : 'STOCK.STATUS.LABEL', valueFilter : 'translate' },
    { key : 'require_po', label : 'STOCK.REQUIRES_PO' },
    { key : 'entity_uuid', label : 'ENTITY.LABEL' },
    { key : 'description', label : 'FORM.LABELS.DESCRIPTION' },
    { key : 'text', label : 'STOCK.DEPOT' },
    { key : 'is_warehouse', label : 'DEPOT.WAREHOUSE' },
    { key : 'patientReference', label : 'FORM.LABELS.REFERENCE_PATIENT' },
    { key : 'requestor_uuid', label : 'REQUISITION.RECEIVER' },
    { key : 'service_uuid', label : 'STOCK.SERVICE' },
    { key : 'is_expired', label : 'STOCK.EXPIRED' },
    { key : 'tag_uuid', label : 'TAG.LABEL' },
    { key : 'tags', label : 'TAG.LABEL' },
    { key : 'show_only_risky', label : 'LOTS.SHOW_ONLY_RISKY' },
    {
      key : 'dateFrom', label : 'FORM.LABELS.DATE', comparitor : '>', valueFilter : 'date',
    },
    {
      key : 'dateTo', label : 'FORM.LABELS.DATE', comparitor : '<', valueFilter : 'date',
    },
    {
      key : 'entry_date_from', label : 'STOCK.ENTRY_DATE', comparitor : '>', valueFilter : 'date',
    },
    {
      key : 'entry_date_to', label : 'STOCK.ENTRY_DATE', comparitor : '<', valueFilter : 'date',
    },
    {
      key : 'expiration_date_from', label : 'STOCK.EXPIRATION_DATE', comparitor : '>', valueFilter : 'date',
    },
    {
      key : 'expiration_date_to', label : 'STOCK.EXPIRATION_DATE', comparitor : '<', valueFilter : 'date',
    },
  ];

  class StockFilterer {
    constructor(cacheKey = 'stock-filterer-cache') {
      this._filters = new Filters();
      this._cache = new AppCache(cacheKey);

      // register default filters
      this._filters.registerDefaultFilters(bhConstants.defaultFilters);

      // register custom filters
      this._filters.registerCustomFilters(customFiltersList);

      // load cached filters
      if (this._cache.filters) {
        this._filters.loadCache(this._cache.filters);
      }

      // assign default filters
      this.assignDefaultFilters();
    }

    get filters() { return this._filters; }

    get cache() { return this._cache; }

    // remove a filter by its key
    remove(valueKey) {
      this._filters.resetFilterState(valueKey);
    }

    // filter display value map
    getDisplayValueMap() {
      return this._filters.getDisplayValueMap();
    }

    // format http
    formatHTTP(format = false) {
      return this._filters.formatHTTP(format);
    }

    // format view
    formatView() {
      return this._filters.formatView();
    }

    // format cache
    formatCache() {
      this._cache.filters = this._filters.formatCache();
    }

    // replace filters
    replaceFilters(changes) {
      this._filters.replaceFilters(changes);
    }

    // replace filters from state
    replaceFiltersFromState(changes) {
      this._filters.replaceFiltersFromState(changes);
    }

    // load cached filters
    loadCachedFilters() {
      this._filters.loadCache(this._cache.filters || {});
    }

    /**
     * @method getQueryString
     * @description
     * returns a query string with parameters with the consideration
     * of the current applied filters
     * @param {string} type
     */
    getQueryString(type) {
      const filterOpts = this._filters.formatHTTP();
      const defaultOpts = { renderer : type, lang : Languages.key };

      // combine options
      const options = angular.merge(defaultOpts, filterOpts);

      // return  serialized options
      return $httpParamSerializer(options);
    }

    assignDefaultFilters() {
      // get the keys of filters already assigned - on initial load this will be empty
      const assignedKeys = Object.keys(this._filters.formatHTTP());

      // assign default limit filter
      if (assignedKeys.indexOf('limit') === -1) {
        this._filters.assignFilter('limit', 100);
      }

      // assign default includeEmptyLot filter
      if (assignedKeys.indexOf('includeEmptyLot') === -1) {
        this._filters.assignFilter('includeEmptyLot', 0);
      }

    }

    assignFilter(key, value) {
      const assignedKeys = Object.keys(this._filters.formatHTTP());
      if (assignedKeys.indexOf(value) === -1) {
        this._filters.assignFilter(key, value);
      }
    }
  }

  return StockFilterer;
}
