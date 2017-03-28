angular.module('bhima.services')
.service('InventoryTypeService', InventoryTypeService);

/** Dependencies infection */
InventoryTypeService.$inject = [ 'PrototypeApiService' ];

/** Inventory Type Service */
function InventoryTypeService(Api) {
  var service = new Api('/inventory/types/');
  return service;
}
