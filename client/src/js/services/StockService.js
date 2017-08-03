angular.module('bhima.services')
  .service('StockService', StockService);

StockService.$inject = [
  'PrototypeApiService', 'FilterService', 'appcache', 'PeriodService',
  '$httpParamSerializer'];

function StockService(Api, Filters, AppCache, Periods, $httpParamSerializer) {

  // API for stock lots
  var stocks = new Api('/stock/lots');

  // API for stock lots in depots
  var lots = new Api('/stock/lots/depots');

  // API for stock lots movements
  var movements = new Api('/stock/lots/movements');

  // API for stock inventory in depots
  var inventories = new Api('/stock/inventories/depots');

  // API for stock integration
  var integration = new Api('/stock/integration');

  //Filter service
  var StockLotFilters = new Filters();
  var filterLotCache = new AppCache('stock-lot-filters');

  StockLotFilters.registerDefaultFilters([
    { key : 'period', label : 'TABLE.COLUMNS.PERIOD', valueFilter : 'translate' },
    { key : 'custom_period_start', label : 'PERIODS.START', comparitor: '>', valueFilter : 'date' },
    { key : 'custom_period_end', label : 'PERIODS.END', comparitor: '<', valueFilter : 'date' },
    { key : 'limit', label : 'FORM.LABELS.LIMIT' }
  ]);

  StockLotFilters.registerCustomFilters([
    { key: 'depot_uuid', label: 'STOCK.DEPOT' },
    { key: 'inventory_uuid', label: 'STOCK.INVENTORY' },
    { key: 'label', label: 'STOCK.LOT' },
    { key : 'entry_date_from', label : 'STOCK.ENTRY_DATE', comparitor: '>', valueFilter : 'date' },
    { key : 'entry_date_to', label : 'STOCK.ENTRY_DATE', comparitor: '<', valueFilter : 'date' },
    { key : 'expiration_date_from', label : 'STOCK.EXPIRATION_DATE', comparitor: '>', valueFilter : 'date' },
    { key : 'expiration_date_to', label : 'STOCK.EXPIRATION_DATE', comparitor: '<', valueFilter : 'date' }
  ]);

  if(filterLotCache.filters){
    StockLotFilters.loadCache(filterLotCache.filters);
  }

  // once the cache has been loaded - ensure that default filters are provided appropriate values
  assignLotDefaultFilters();

  function assignLotDefaultFilters() {
    // get the keys of filters already assigned - on initial load this will be empty
    var assignedKeys = Object.keys(StockLotFilters.formatHTTP());

    // assign default period filter
    var periodDefined =
      lots.util.arrayIncludes(assignedKeys, ['period']);

    if (!periodDefined) {
      StockLotFilters.assignFilters(Periods.defaultFilters());
    }

    // assign default limit filter
    if (assignedKeys.indexOf('limit') === -1) {
      StockLotFilters.assignFilter('limit', 100);
    }
  }

  function removeLotFilter(key) {
    StockLotFilters.resetFilterState(key);
  };

  // load filters from cache
  function cacheLotFilters() {
    filterLotCache.filters = StockLotFilters.formatCache();
  };

  function loadCachedLotFilters() {
    StockLotFilters.loadCache(filterLotCache.filters || {});
  };

  // downloads a type of report based on the
  function download(type) {
    var filterOpts = StockLotFilters.formatHTTP();
    var defaultOpts = { renderer : type, lang : Languages.key };

    // combine options
    var options = angular.merge(defaultOpts, filterOpts);

    // return  serialized options
    return $httpParamSerializer(options);
  };

  var service = {
    stocks       : stocks,
    lots         : lots,
    movements    : movements,
    inventories  : inventories,
    integration  : integration,
    lotFilters   : StockLotFilters,
    cacheLotFilters : cacheLotFilters,
    removeLotFilter : removeLotFilter,
    loadCachedLotFilters : loadCachedLotFilters,
    download     : download,
  };

  return service;
}
