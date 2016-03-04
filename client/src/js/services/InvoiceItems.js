/**
 * @todo Redefine API - InventoryItems.addInventoryItem() doesn't make any sense
 *
 * @todo All perecentages/ value manipulations should be rounded in a known fassion (or done at total calculation)
 *
 * @todo Think through all use cases with cache
 * - right now if many sales are not submitted and cancelled the cache will store all confirmed items until it is submitted or deleted
 *
 */
'use strict';

angular.module('bhima.services')
  .service('InvoiceItems', InvoiceItems);

InvoiceItems.$inject = ['InventoryService', 'uuid', 'store', 'appcache'];

function InvoiceItems(InventoryService, Uuid, Store, AppCache) { 
  
  /** [rename] Available inventory items. */
  //service.availableInventory = availableInventory
  //service.total = total;
    
  var service = this;
  console.log('invoice items service fired');

  // TODO ItemsCache could be its own service - this takes up a lot of code
  // TODO This could be passed in to allow a seperation of patient invoices, 
  // purcahse orders etc. 
  var cacheKey = 'invoice_key';
  var appcache = new AppCache(cacheKey);
  
  
  service.cacheAvailable = false;
  
    
  // variable to track initial number of inventory items - significantly reduces
  // validating method complexity
  var totalInventoryItems;
  service.inventoryItemsLoaded = false;
  var options = { identifier : 'uuid' };
  var items = new Store(options);
  service.items = items;

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

  // this.currentItems = function currentItems() { 
  //   return current.data;
  // };
  
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
  
  service.configureBase = function configureBase() { 
  
    // Add intial item 
    addItem();

    // Update cache
    // Prepare/ check cache
    // If items exist this means a sale was interrupted or incomplete - 
    // this method will allow repopulation of items
    appcache.fetchAll()
      .then(configureCachedItems);
  }
  
  // this.total = function total() { 
  //   var t = service.current.data.reduce(sumTotalCost, 0);
  //   return t;
  // };

  this.removeItem = function removeItem(item) { 
    
    // Remove the entity from the current list of sale items
    service.current.remove(item.uuid);
    
    console.log('removed');
    console.log(service.current.data);

    // If the item has had an inventory assigned to it, add this item back into the pool of available inventory items
    if (item.sourceInventoryItem) { 
      items.post(item.sourceInventoryItem);
      appcache.remove(item.sourceInventoryItem.uuid);
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
    // Remove item from being able to be selected an additional time
    items.remove(item.inventoryUuid);

    appcache.put(inventoryItem.uuid, {
      confirmed : true
    }); 
  };

  this.loaded = function loaded() { 
    return service.inventoryItemsLoaded;
  };

  this.setPriceList = function setPriceList(priceList) { 
    this.priceList = new Store({identifier : 'inventory_uuid'});
    this.priceList.setData(priceList.items);
  };
  
  // Accepts flag to remove everything or only unconfirmed items
  this.removeItems = function removeItems(removeConfirmed) { 
    
    // This cannot read removeConfirmed = removeConfirmed || true because it equates to false
    if (angular.isUndefined(removeConfirmed)) { 
      removeConfirmed = true; 
    };

    var numberOfItems = service.current.data.length;

    // console.log('resett', service.current);
    
    for (var i = 0; i < numberOfItems; i++) { 
      var item = service.current.data[0];
      // console.log('removing item', item);

      // Remove items one by one to respect remove rules
      
      if (!removeConfirmed && item.confirmed) {
        console.log('ITEM WAS NOT REMOVED'); 
      } else { 
        console.log('ITEM WAS REMOVED', removeConfirmed, item.confirmed); 
        service.removeItem(item);
      
      }
    }
    // service.current.data.forEach(function (item) { 
      // service.removeItem(item);
    // });
  };

  this.verify = function verify() { 
    var invalidItem;

    service.current.data.some(function (item) { 
      var invalid = false;
      console.log('verifying item...');
  
      // Most of these cases should be impossible to reach
      // Check item has been confirmed
      if (!item.confirmed) { 
        invalid = true;
      }
    
      if (!angular.isNumber(item.quantity)) { 
        invalid = true;
      }

      if (!angular.isNumber(item.unit_price)) { 
        invalid = true;
      }

      if (item.quantity <= 0) { 
        invalid = true;
      }
      
      if (item.unit_price < 0) { 
        invalid = false;
      }

      if (invalid) {
        invalidItem = item;
        return true;
      } 
        
      return false;
    });


    return invalidItem;
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

  function configureCachedItems(items) { 
  
    console.log('found items', items);
    var cacheFound = angular.isDefined(items) && items !== null;
    
    if (!cacheFound) { 
      
      // No cache is available
      return;
    }
    
    service.recoveredCache = items;
    
    if (items.length > 0) { 
      service.cacheAvailable = true;
    }
  }


  service.recoverCache = function recoverCache() { 
    var cached = service.recoveredCache;
  
    // Remove any unconfirmed items - they will cause unexpected results
    service.removeItems(false);

    cached.forEach(function (item) { 
      
      // Verify that the item is not already confirmed 
      // We can check this by only adding items that can be found in the remaining available
      // FIXME
      var itemIsValid = items.get(item.key);

      if (itemIsValid) { 
        // Add and confirm item 
        var placeholderItem = addItem(); 
        
        placeholderItem.inventoryUuid = item.key;

        // Ensure placeholder is not null - in this case too many items are assigned
        service.confirmItem(placeholderItem);

      } else { 
        // object was either already assigned or inventory item no longer exists
        
        console.log('invnetory item was already assigned or is no longer available in the database');
      }
    });

    // Remove empty items
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
      var item = new Item();

      service.current.post(item);
      return item;
    }
  };
  
  return service;
}
