angular.module('bhima.services')
  .service('InventoryTypeService', InventoryTypeService);

/** Dependencies infection */
InventoryTypeService.$inject = ['PrototypeApiService'];

/** Inventory Type Service */
function InventoryTypeService(Api) {
  const service = new Api('/inventory/types/');
  return service;
}
