angular.module('bhima.services')
.service('InventoryUnitService', InventoryUnitService);

/** Dependencies infection */
InventoryUnitService.$inject = [ 'PrototypeApiService' ];

/** Inventory Unit Service */
function InventoryUnitService(PrototypeApiService) {
  var service = new PrototypeApiService('/inventory/units/');
  return service;
}
