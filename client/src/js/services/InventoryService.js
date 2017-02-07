angular.module('bhima.services')
  .service('InventoryService', InventoryService);

InventoryService.$inject = [
  'PrototypeApiService', 'InventoryGroupService', 'InventoryUnitService', 'InventoryTypeService'
];

function InventoryService(Api, Groups, Units, Types) {
  var service = new Api('/inventory/metadata/');

  // expose inventory services through a nicer API
  service.Groups = Groups;
  service.Units = Units;
  service.Types = Types;

  return service;
}
