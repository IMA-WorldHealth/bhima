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
    this.inventory_uuid = null;
    this.code = null;
    this.label = null;
    this.quantity = 0;
    this.unit_cost = 0;
    this.expiration_date = new Date();
    this.lots = [];
    this.isValid = false;

    this.validate();
  }

  StockItem.prototype.validate = function validate() {
    this.isValid = this.inventory_uuid && this.lots.length > 0 && this.code;
  }
  
  return StockItem;
}
