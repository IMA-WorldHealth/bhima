angular.module('bhima.services')
.service('PurchaseOrderItemService', PurchaseOrderItemService);

PurchaseOrderItemService.$inject = [ 'uuid' ];

/**
 * @class PurchaseOrderItemService
 *
 * @description
 * This class implements the defaults for a purchase order item.  The class is
 * instantiated with every row of the Purchase Order module's grid.  It
 * implements the following convenience methods:
 *  1. validate() - sets the `_valid` and `_invalid` flags on the row
 *  2. configure() - sets up the row's inventory item reference
 */
function PurchaseOrderItemService(uuid) {

  /**
   * @constructor
   *
   * @description
   * Sets up the default values for the invoice item.  Optionally takes in an
   * inventory item to preconfigure the invoice item, otherwise, it will be
   * set later.
   *
   * @param {Object} inventoryItem - an inventory item to use as the inventory
   *   line.
   */
  function PurchaseOrderItem(inventoryItem) {

    // defaults
    this.uuid = uuid();

    // instance variable tracks if the row is valid
    this._valid = false;

    // instance variable tracks if the row has an inventory uuid
    this._initialised = false;

    // if inventoryItem exists, call the configure method right away
    if (inventoryItem) {
      this.configure(inventoryItem);
    }
  }

  /**
   * @method validate
   *
   * @description
   * Validation for single PurchaseOrderItem.  This is a prototype method since
   * we are expecting to create potentially many items in an invoice.
   */
  PurchaseOrderItem.prototype.validate = function validate() {
    var item = this;

    // ensure the numbers are valid in the invoice
    var hasValidNumbers =
      angular.isNumber(item.quantity) &&
      angular.isNumber(item.unit_price) &&
      item.quantity > 0 &&
      item.unit_price >= 0;

    // the item is only initialised if it has an inventory item
    item._initialised = angular.isDefined(item.inventory_uuid);

    // alias both valid and invalid for easy reading
    item._valid = item._initialised && hasValidNumbers;
    item._invalid = !item._valid;
  };

  /**
   * @method configure
   *
   * @description
   * This method configures the PurcherOrderItem with an inventory item.
   *
   * @param {Object} inventoryItem - an inventory item to copy into the view
   */
  PurchaseOrderItem.prototype.configure = function configure(inventoryItem) {
    this.quantity = 1;
    this.code = inventoryItem.code;
    this.description = inventoryItem.label;
    this.unit_price = inventoryItem.price;
    this.inventory_uuid = inventoryItem.uuid;
    this.unit = inventoryItem.unit;

    // reset the validation flags.
    this.validate();
  };

  return PurchaseOrderItem;
}
