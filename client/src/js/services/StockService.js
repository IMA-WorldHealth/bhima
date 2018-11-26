angular.module('bhima.services')
  .service('StockService', StockService);

StockService.$inject = [
  'PrototypeApiService', 'FilterService', 'appcache', 'PeriodService',
  '$httpParamSerializer', 'LanguageService', 'bhConstants', 'util',
];

function StockService(Api, Filters, AppCache, Periods, $httpParamSerializer, Languages, bhConstants, Util) {
  // API for stock lots
  const stocks = new Api('/stock/lots');

  // API for stock lots in depots
  const lots = new Api('/stock/lots/depots');

  // API for stock lots movements
  const movements = new Api('/stock/lots/movements');

  // API for stock inventory in depots
  const inventories = new Api('/stock/inventories/depots');

  // API for stock integration
  const integration = new Api('/stock/integration');

  // API for stock transfer
  const transfers = new Api('/stock/transfers');

  // API for stock import
  const importing = new Api('/stock/import');

  // stock status label keys
  const stockStatusLabelKeys = {
    sold_out          : 'STOCK.STATUS.SOLD_OUT',
    in_stock          : 'STOCK.STATUS.IN_STOCK',
    security_reached  : 'STOCK.STATUS.SECURITY',
    minimum_reached   : 'STOCK.STATUS.MINIMUM',
    over_maximum      : 'STOCK.STATUS.OVER_MAX',
  };

  const customFiltersList = [
    { key : 'depot_uuid', label : 'STOCK.DEPOT' },
    { key : 'inventory_uuid', label : 'STOCK.INVENTORY' },
    { key : 'group_uuid', label : 'STOCK.INVENTORY_GROUP' },
    { key : 'label', label : 'STOCK.LOT' },
    { key : 'is_exit', label : 'STOCK.OUTPUT' },
    { key : 'reference', label : 'FORM.LABELS.REFERENCE' },
    { key : 'flux_id', label : 'STOCK.FLUX' },
    { key : 'user_id', label : 'FORM.LABELS.USER' },
    { key : 'status', label : 'STOCK.STATUS.LABEL', valueFilter : 'translate' },
    { key : 'require_po', label : 'STOCK.REQUIRES_PO' },
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

      // assign default period filter
      const periodDefined = Util.arrayIncludes(assignedKeys, ['period']);

      if (!periodDefined) {
        this._filters.assignFilters(Periods.defaultFilters());
      }

      // assign default limit filter
      if (assignedKeys.indexOf('limit') === -1) {
        this._filters.assignFilter('limit', 100);
      }
    }
  }

  // Filter service
  const StockLotFilters = new StockFilterer('stock-movement-filters');
  const StockMovementFilters = new StockFilterer('stock-lot-filters');
  const StockInventoryFilters = new StockFilterer('stock-inventory-filters');

  // creating an object of filter to avoid method duplication
  const stockFilter = {
    lot : StockLotFilters,
    movement : StockMovementFilters,
    inventory : StockInventoryFilters,
  };

  // uniformSelectedEntity function implementation
  // change name, text and display_nam into displayName
  function uniformSelectedEntity(entity) {
    if (!entity) {
      return {};
    }

    const keys = ['name', 'text', 'display_name'];

    keys.forEach((key) => {
      if (entity[key]) {
        entity.displayName = entity[key];
      }
    });

    return {
      uuid : entity.uuid || '',
      reference : entity.reference || '',
      displayName : entity.displayName || '',
    };
  }

  /**
   * @function processLotsFromStore
   *
   * @description
   * This function loops through the store's contents mapping them into a flat array
   * of lots.
   *
   * @returns {Array} - lots in an array.
 */
  function processLotsFromStore(data, uuid) {
    return data.reduce((current, line) => {
      return line.lots.map((lot) => {
        return {
          uuid : lot.uuid || null,
          label : lot.lot,
          initial_quantity : lot.quantity,
          quantity : lot.quantity,
          unit_cost : line.unit_cost,
          expiration_date : lot.expiration_date,
          inventory_uuid : line.inventory_uuid,
          origin_uuid : uuid,
        };
      }).concat(current);
    }, []);
  }

  /** Get label for purchase Status */
  function statusLabelMap(status) {
    return stockStatusLabelKeys[status];
  }

  // download the template file
  function downloadTemplate() {
    const url = importing.url.concat('/template');
    return importing.$http.get(url)
      .then(response => {
        return importing.util.download(response, 'Import Stock Template', 'csv');
      });
  }

  return {
    stocks,
    lots,
    movements,
    inventories,
    integration,
    transfers,
    filter : stockFilter,
    uniformSelectedEntity,
    processLotsFromStore,
    statusLabelMap,
    downloadTemplate,
  };
}
