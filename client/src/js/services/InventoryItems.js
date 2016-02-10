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
  var used = new Store(options);
  used.setData([]);
  
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

  this.addItem = function addItem() { 
  
    // Only add sale items if there are possible inventory item options
    if (this.inventoryItemAvailable()) {
      this.current.post(new Item());
    }
  };

  this.inventoryItemAvailable = function inventoryItemAvailable() { 
    return service.current.data.length < totalInventoryItems;
  }

  this.total = function total() { 
    var t = service.current.data.reduce(sumTotalCost, 0);
    return t;
  };

  this.removeItem = function removeItem(item) { 
    console.log('remove item called', item);
    
    service.current.remove(item.uuid);
    items.post(item);
    used.remove(item.inventoryUuid);

    
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

    used.post(inventoryItem);
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

  return service;
}
