angular.module('bhima.services')
  .service('StockService', StockService);

StockService.$inject = [
  'PrototypeApiService', 'FilterService', 'appcache', 'PeriodService',
  '$httpParamSerializer', 'LanguageService', 'bhConstants',
];

function StockService(Api, Filters, AppCache, Periods, $httpParamSerializer, Languages, bhConstants) {
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

  // Filter service
  const StockLotFilters = new Filters();
  const StockMovementFilters = new Filters();
  const StockInventoryFilters = new Filters();

  const filterMovementCache = new AppCache('stock-movement-filters');
  const filterLotCache = new AppCache('stock-lot-filters');
  const filterInventoryCache = new AppCache('stock-inventory-filters');

  StockLotFilters.registerDefaultFilters(bhConstants.defaultFilters);
  StockMovementFilters.registerDefaultFilters(bhConstants.defaultFilters);
  StockInventoryFilters.registerDefaultFilters(bhConstants.defaultFilters);

  StockLotFilters.registerCustomFilters([
    { key : 'depot_uuid', label : 'STOCK.DEPOT' },
    { key : 'inventory_uuid', label : 'STOCK.INVENTORY' },
    { key : 'group_uuid', label : 'STOCK.INVENTORY_GROUP' },
    { key : 'label', label : 'STOCK.LOT' },
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
  ]);

  StockMovementFilters.registerCustomFilters([
    { key : 'is_exit', label : 'STOCK.OUTPUT' },
    { key : 'depot_uuid', label : 'STOCK.DEPOT' },
    { key : 'inventory_uuid', label : 'STOCK.INVENTORY' },
    { key : 'label', label : 'STOCK.LOT' },
    { key : 'flux_id', label : 'STOCK.FLUX' },
    {
      key : 'dateFrom', label : 'FORM.LABELS.DATE', comparitor : '>', valueFilter : 'date',
    },
    {
      key : 'dateTo', label : 'FORM.LABELS.DATE', comparitor : '<', valueFilter : 'date',
    },
    { key : 'user_id', label : 'FORM.LABELS.USER' },
    { key : 'documentReference', label : 'TABLE.COLUMNS.REFERENCE' },
  ]);

  StockInventoryFilters.registerCustomFilters([
    { key : 'depot_uuid', label : 'STOCK.DEPOT' },
    { key : 'inventory_uuid', label : 'STOCK.INVENTORY' },
    { key : 'group_uuid', label : 'STOCK.INVENTORY_GROUP' },
    { key : 'status', label : 'STOCK.STATUS.LABEL', valueFilter : 'translate' },
    { key : 'require_po', label : 'STOCK.REQUIRES_PO' },
  ]);


  if (filterLotCache.filters) {
    StockLotFilters.loadCache(filterLotCache.filters);
  }

  if (filterMovementCache.filters) {
    StockMovementFilters.loadCache(filterMovementCache.filters);
  }

  if (filterInventoryCache.filters) {
    StockInventoryFilters.loadCache(filterInventoryCache.filters);
  }

  // once the cache has been loaded - ensure that default filters are provided appropriate values
  assignLotDefaultFilters();
  assignMovementDefaultFilters();
  assignInventoryDefaultFilters();

  // creating an object of filter to avoid method duplication
  const stockFilter = {
    lot : StockLotFilters,
    movement : StockMovementFilters,
    inventory : StockInventoryFilters,
  };

  // creating an object of filter object to avoid method duplication
  const filterCache = {
    lot : filterLotCache,
    movement : filterMovementCache,
    inventory : filterInventoryCache,
  };

  function assignLotDefaultFilters() {
    // get the keys of filters already assigned - on initial load this will be empty
    const assignedKeys = Object.keys(StockLotFilters.formatHTTP());

    // assign default period filter
    const periodDefined = lots.util.arrayIncludes(assignedKeys, ['period']);

    if (!periodDefined) {
      StockLotFilters.assignFilters(Periods.defaultFilters());
    }

    // assign default limit filter
    if (assignedKeys.indexOf('limit') === -1) {
      StockLotFilters.assignFilter('limit', 100);
    }
  }

  function assignMovementDefaultFilters() {
    // get the keys of filters already assigned - on initial load this will be empty
    const assignedKeys = Object.keys(StockMovementFilters.formatHTTP());

    // assign default period filter
    const periodDefined = movements.util.arrayIncludes(assignedKeys, ['period']);

    if (!periodDefined) {
      StockMovementFilters.assignFilters(Periods.defaultFilters());
    }

    // assign default limit filter
    if (assignedKeys.indexOf('limit') === -1) {
      StockMovementFilters.assignFilter('limit', 100);
    }
  }

  function assignInventoryDefaultFilters() {
    // get the keys of filters already assigned - on initial load this will be empty
    const assignedKeys = Object.keys(StockInventoryFilters.formatHTTP());

    // assign default period filter
    const periodDefined = inventories.util.arrayIncludes(assignedKeys, ['period']);

    if (!periodDefined) {
      StockInventoryFilters.assignFilters(Periods.defaultFilters());
    }

    // assign default limit filter
    if (assignedKeys.indexOf('limit') === -1) {
      StockInventoryFilters.assignFilter('limit', 100);
    }
  }

  function removeFilter(filterKey, valueKey) {
    stockFilter[filterKey].resetFilterState(valueKey);
  }

  // load filters from cache
  function cacheFilters(filterKey) {
    filterCache[filterKey].filters = stockFilter[filterKey].formatCache();
  }

  function loadCachedFilters(filterKey) {
    stockFilter[filterKey].loadCache(filterCache[filterKey].filters || {});
  }

  /**
   * @function getQueryString
   * @description
   * returns a query string with parameters with the consideration
   * of the current applied filters
   * @param {string} filterKey
   * @param {string} type
   */
  function getQueryString(filterKey, type) {
    const filterOpts = stockFilter[filterKey].formatHTTP();
    const defaultOpts = { renderer : type, lang : Languages.key };

    // combine options
    const options = angular.merge(defaultOpts, filterOpts);

    // return  serialized options
    return $httpParamSerializer(options);
  }

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
    cacheFilters,
    removeFilter,
    loadCachedFilters,
    getQueryString,
    uniformSelectedEntity,
    processLotsFromStore,
    statusLabelMap,
    downloadTemplate,
  };
}
