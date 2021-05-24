angular.module('bhima.services')
  .service('StockService', StockService);

StockService.$inject = [
  'PrototypeApiService', 'StockFilterer', 'HttpCacheService', 'util', 'PeriodService',
];

function StockService(Api, StockFilterer, HttpCache, util, Periods) {
  // API for stock lots
  const stocks = new Api('/stock/lots');

  // API for stock lots in depots
  const lots = new Api('/stock/lots/depots');

  // API for stock lots in depots With detailed information
  const lotsDetailed = new Api('/stock/lots/depotsDetailed');

  // API for stock lots movements
  const movements = new Api('/stock/lots/movements/');

  // API for stock lots movements
  const inlineMovements = new Api('/stock/movements/');

  const status = new Api('/stock/status');

  // API for stock inventory in depots
  const inventories = new Api('/stock/inventories/depots');

  // the stock inventories route gets hit a lot.  Cache the results on the client.
  inventories.read = cacheInventoriesRead;

  const callback = (uuid, options) => Api.read.call(inventories, uuid, options);
  const fetcher = HttpCache(callback, 5000);

  /**
   * The read() method loads data from the api endpoint. If an id is provided,
   * the $http promise is resolved with a single JSON object, otherwise an array
   * of objects should be expected.
   *
   @param {String} uuid - the uuid of the inventory to fetch (optional).

   * @param {Object} options - options to be passed as query strings (optional).
   * @param {Boolean} cacheBust - ignore the cache and send the HTTP request directly
   *   to the server.
   * @return {Promise} promise - resolves to either a JSON (if id provided) or
   *   an array of JSONs.
   */
  function cacheInventoriesRead(uuid, options, cacheBust = false) {
    return fetcher(uuid, options, cacheBust);
  }

  // API for stock inventory adjustment
  const inventoryAdjustment = new Api('/stock/inventory_adjustment');

  // API for stock integration
  const integration = new Api('/stock/integration');

  // API for stock transfer
  const transfers = new Api('/stock/transfers');

  // API for stock import
  const importing = new Api('/stock/import');

  // API for stock assignment
  const stockAssign = new Api('/stock/assign/');

  // API for stock requisition
  const stockRequisition = new Api('/stock/requisition/');

  // API for stock requisition
  const stockRequestorType = new Api('/stock/requestor_type/');

  // API for stock Aggregated Consumption
  const aggregatedConsumption = new Api('/stock/aggregated_consumption');

  // Overide the stock assign api
  stockAssign.remove = uuid => {
    return stockAssign.$http.put(`/stock/assign/${uuid}/remove`)
      .then(stockAssign.util.unwrapHttpResponse);
  };

  // stock status label keys
  const stockStatusLabelKeys = {
    stock_out         : 'STOCK.STATUS.STOCK_OUT',
    in_stock          : 'STOCK.STATUS.IN_STOCK',
    security_reached  : 'STOCK.STATUS.SECURITY',
    minimum_reached   : 'STOCK.STATUS.MINIMUM',
    over_maximum      : 'STOCK.STATUS.OVER_MAX',
    unused_stock      : 'STOCK.STATUS.UNUSED_STOCK',
  };

  // Filter service
  const StockLotFilters = new StockFilterer('stock-lot-filters');
  const StockAssignFilters = new StockFilterer('stock-assign-filters');
  const StockRequisitionFilters = new StockFilterer('stock-requisition-filters');
  const StockMovementFilters = new StockFilterer('stock-inline-movement-filters');
  const StockInventoryFilters = new StockFilterer('stock-inventory-filters');
  const StockDepotFilters = new StockFilterer('stock-depot-filters');

  // creating an object of filter to avoid method duplication
  const stockFilter = {
    lot : StockLotFilters,
    stockAssign : StockAssignFilters,
    movements : StockMovementFilters,
    inventory : StockInventoryFilters,
    depot : StockDepotFilters,
    requisition : StockRequisitionFilters,
  };

  function assignDefaultPeriodFilters(filterService) {
    // get the keys of filters already assigned - on initial load this will be empty
    const assignedKeys = Object.keys(filterService._filters.formatHTTP());

    // assign default period filter
    const periodDefined = util.arrayIncludes(assignedKeys, [
      'period', 'custom_period_start', 'custom_period_end',
    ]);

    if (!periodDefined) {
      filterService._filters.assignFilters(Periods.defaultFilters());
    }
  }

  // assign default period filter to inlineStockMovements
  assignDefaultPeriodFilters(stockFilter.movements);

  function assignNoEmptyLotsDefaultFilter(service) {
    // add in the default key for the stock lots filter
    const assignedKeys = Object.keys(service._filters.formatHTTP());
    // assign default includeEmptyLot filter
    if (assignedKeys.indexOf('includeEmptyLot') === -1) {
      service._filters.assignFilter('includeEmptyLot', 0);
    }
  }

  // assign non empty lots filter to the stockLots Filterer
  assignNoEmptyLotsDefaultFilter(stockFilter.lot);

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
   * This function loops through the store's contents mapping them into a flat
   * array of lots.
   *
   * @returns {Array} - lots in an array.
 */
  function processLotsFromStore(data) {
    return data.reduce((current, line) => {
      return line.lots.map((lot) => {
        return {
          uuid : lot.uuid || null,
          label : lot.lot,
          quantity : lot.quantity,
          unit_cost : line.unit_cost,
          expiration_date : lot.expiration_date,
          inventory_uuid : line.inventory_uuid,
        };
      }).concat(current);
    }, []);
  }

  /** Get label for purchase Status */
  function statusLabelMap(_status_) {
    return stockStatusLabelKeys[_status_];
  }

  // download the template file
  function downloadTemplate() {
    const url = importing.url.concat('/template');
    return importing.$http.get(url)
      .then(response => {
        return importing.util.download(response, 'Import Stock Template', 'csv');
      });
  }

  inventories.loadAMCForInventory = function loadAMCForInventory(inventoryUuid, depotUuid) {
    return inventories.$http.get(`/depots/${depotUuid}/inventories/${inventoryUuid}/cmm`)
      .then(util.unwrapHttpResponse);
  };

  return {
    stocks,
    stockAssign,
    stockRequisition,
    stockRequestorType,
    inventoryAdjustment,
    lots,
    lotsDetailed,
    movements,
    inlineMovements,
    inventories,
    integration,
    transfers,
    filter : stockFilter,
    uniformSelectedEntity,
    processLotsFromStore,
    statusLabelMap,
    downloadTemplate,
    status,
    aggregatedConsumption,
  };
}
