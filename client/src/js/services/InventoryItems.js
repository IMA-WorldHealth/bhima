/**
 * @todo Redefine API - InventoryItems.addInventoryItem() doesn't make any sense
 */
'use strict';

angular.module('bhima.services')
  .service('InventoryItems', InventoryItems);

InventoryItems.$inject = ['InventoryService', 'uuid', 'store'];

function InventoryItems(InventoryService, Uuid, Store) { 
  
  /** [rename] Available inventory items. */
  //service.availableInventory = availableInventory
  //service.total = total;
  
  var service = this;

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

  this.total = function total() { 
    var t = service.current.data.reduce(sumTotalCost, 0);
    return t;
  };

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
    console.log(item);
    console.log('inventoryItem', inventoryItem);

    item.confirmed = true;
    item.quantity = 1;
    item.unit_price = inventoryItem.price;
    item.amount = 0;
    item.code = inventoryItem.code;
    item.description = inventoryItem.label;
  
    console.log('items before', items);
  
    // Track inventory item in case this entity is removed and the item should be available for re-uese 
    item.sourceInventoryItem = inventoryItem;
   
    // used.post(inventoryItem);
    items.remove(item.inventoryUuid);
    console.log('items after', items);
  }

  this.loaded = function loaded() { 
    return service.inventoryItemsLoaded;
  }

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
  function sumTotalCost(currentCost, item) { 
    var itemIsValid =
      angular.isNumber(item.quantity) && 
      angular.isNumber(item.unit_price);
    
    if(itemIsValid) { 
      currentCost += (item.quantity * item.unit_price);
    }

    return currentCost;
  }
  
  function addItem() { 
  
    // Only add sale items if there are possible inventory item options
    if (!service.allAssigned()) {
      service.current.post(new Item());
    }
  };


  return service;
}
