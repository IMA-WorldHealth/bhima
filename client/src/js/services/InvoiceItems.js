/**
 * @todo Redefine API - InventoryItems.addInventoryItem() doesn't make any sense
 *
 * @tood All perecentages/ value manipulations should be rounded in a known fassion (or done at total calculation)
 *
 */
'use strict';

angular.module('bhima.services')
  .service('InvoiceItems', InvoiceItems);

InvoiceItems.$inject = ['InventoryService', 'uuid', 'store'];

function InvoiceItems(InventoryService, Uuid, Store) { 
  
  /** [rename] Available inventory items. */
  //service.availableInventory = availableInventory
  //service.total = total;
    
  var service = this;
  console.log('invoice items service fired');

  // variable to track initial number of inventory items - significantly reduces
  // validating method complexity
  var totalInventoryItems;
  service.inventoryItemsLoaded = false;
  var options = { identifier : 'uuid' };
  var items = new Store(options);

  // FIXME
  // var used = new Store(options);
  // used.setData([]);
  
  // Expose store
  this.current = new Store(options);
  this.current.setData([]);
  
  this.priceList = null;

  // Expose blueprint 
  this.available = function available() { 
    return items.data;  
  };

  this.currentItems = function currentItems() { 
    return current.data;
  };
  
  this.addInventoryItem = function addInventoryItem(totalItems) { 
    var totalItems = totalItems || 1;

    // console.log(vm.availableInventoryItems());
    // TODO Validate total items is a reasonable value

    for (var i = 0; i < totalItems; i++) { 
      addItem();
    }
  };
  
  this.allAssigned = function allAssigned() { 
    return service.current.data.length === totalInventoryItems;
  }

  // this.total = function total() { 
  //   var t = service.current.data.reduce(sumTotalCost, 0);
  //   return t;
  // };

  this.removeItem = function removeItem(item) { 
    console.log('remove item called', item);
  
    // Remove the entity from the current list of sale items
    service.current.remove(item.uuid);

    // If the item has had an inventory assigned to it, add this item back into the pool of available inventory items
    if (item.sourceInventoryItem) { 
      items.post(item.sourceInventoryItem);
    }
  };

  this.confirmItem = function confirmItem(item) { 
    var inventoryItem = items.get(item.inventoryUuid);
    
    console.log('inventoryItem', inventoryItem);

    item.confirmed = true;
    item.quantity = 1;
    item.unit_price = inventoryItem.price;
    
    applyPriceList(item);

    item.amount = 0;
    item.code = inventoryItem.code;
    item.description = inventoryItem.label;
  
    // Track inventory item in case this entity is removed and the item should be available for re-uese 
    item.sourceInventoryItem = inventoryItem;
   
    // used.post(inventoryItem);
    items.remove(item.inventoryUuid);
  };

  this.loaded = function loaded() { 
    return service.inventoryItemsLoaded;
  };

  this.setPriceList = function setPriceList(priceList) { 
    this.priceList = new Store({identifier : 'inventory_uuid'});
    this.priceList.setData(priceList.items);
  };

  InventoryService.getInventoryItems()
    .then(function (result) { 

      // items = items.concat(result);
      items.setData(result);
      service.inventoryItemsLoaded = true;
      totalInventoryItems = items.data.length;
    });

  function Item() { 
    return { 
      confirmed : false,
      uuid : Uuid()
    }
  }

  /**
   * Utility methods 
   */

  function applyPriceList(item) { 
    if (angular.isDefined(service.priceList)) { 

      var priceReference = service.priceList.get(item.inventoryUuid);
      
      if (angular.isDefined(priceReference)) { 
        item.priceListApplied = true;
        
        if (priceReference.is_percentage) { 
          
          // value is intended to manipulate line items base price 
          item.unit_price += (item.unit_price / 100) * priceReference.value;
        } else { 
          
          // value is intended to directly reflect line items price
          item.unit_price = priceReference.value;
        }
      }
    }
  }

  function addItem() { 
  
    // Only add sale items if there are possible inventory item options
    if (!service.allAssigned()) {
      service.current.post(new Item());
    }
  };
  
  return service;
}
