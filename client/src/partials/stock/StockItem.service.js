angular.module('bhima.services')
.service('StockItemService', StockItemService);

StockItemService.$inject = [];

/**
 * @class StockItem
 */
function StockItemService() {
  /**
   * @constructor StockItem
   */
  function StockItem() {
    var self = this;

    // index
    self.index = 0;

    // inventory
    self.inventory_uuid = null;
    self.code = null;
    self.text = null;

    // lot
    self.lot_uuid = null;
    self.label = null;
    self.quantity = 0;
    self.available = 0;
    self.unit_price = 0;
    self.amount = 0;
    self.expiration_date = null;

    // lots
    self.lots = [];

    // validation
    self.validation = function () {
      self.no_missing = self.inventory_uuid && self.lot_uuid &&
      self.quantity && self.expiration_date &&
      self.quantity <= self.available;
    };

    self.validation();
  }

  return StockItem;
}
