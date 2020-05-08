angular.module('bhima.services')
  .service('StockService', StockService);

StockService.$inject = [
  'PrototypeApiService', 'StockFilterer',
];

function StockService(Api, StockFilterer) {
  // API for stock lots
  const stocks = new Api('/stock/lots');

  // API for stock lots in depots
  const lots = new Api('/stock/lots/depots');

  // API for stock lots movements
  const movements = new Api('/stock/lots/movements');

  const status = new Api('/stock/status');

  // API for stock inventory in depots
  const inventories = new Api('/stock/inventories/depots');

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

  // Overide the stock assign api
  stockAssign.remove = uuid => {
    return stockAssign.$http.put(`/stock/assign/${uuid}/remove`)
      .then(stockAssign.util.unwrapHttpResponse);
  };

  // stock status label keys
  const stockStatusLabelKeys = {
    sold_out          : 'STOCK.STATUS.SOLD_OUT',
    in_stock          : 'STOCK.STATUS.IN_STOCK',
    security_reached  : 'STOCK.STATUS.SECURITY',
    minimum_reached   : 'STOCK.STATUS.MINIMUM',
    over_maximum      : 'STOCK.STATUS.OVER_MAX',
  };

  // Filter service
  const StockLotFilters = new StockFilterer('stock-lot-filters');
  const StockAssignFilters = new StockFilterer('stock-assign-filters');
  const StockRequisitionFilters = new StockFilterer('stock-requisition-filters');
  const StockMovementFilters = new StockFilterer('stock-movement-filters');
  const StockInventoryFilters = new StockFilterer('stock-inventory-filters');
  const StockDepotFilters = new StockFilterer('stock-depot-filters');

  // creating an object of filter to avoid method duplication
  const stockFilter = {
    lot : StockLotFilters,
    stockAssign : StockAssignFilters,
    movement : StockMovementFilters,
    inventory : StockInventoryFilters,
    depot : StockDepotFilters,
    requisition : StockRequisitionFilters,
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
    stockAssign,
    stockRequisition,
    stockRequestorType,
    inventoryAdjustment,
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
    status,
  };
}
