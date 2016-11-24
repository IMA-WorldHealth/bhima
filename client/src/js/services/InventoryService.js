angular.module('bhima.services')
.service('InventoryService', InventoryService);

InventoryService.$inject = [ 'PrototypeApiService' ];

function InventoryService(Api) {
  var service = new Api('/inventory/metadata/');

  service.clean  = clean;

  // FIXME this getInventoryItems function need to be deleted
  service.getInventoryItems = function () {
    return this.read();
  };

  /** format data to data structure in the db */
  function clean(session) {
    return {
      uuid        : session.uuid,
      code        : session.code,
      price       : session.price,
      text        : session.label,
      group_uuid  : session.group ? session.group.uuid : null,
      unit_id     : session.unit ? session.unit.id : null,
      type_id     : session.type ? session.type.id : null,
      unit_weight : session.unit_weight,
      unit_volume : session.unit_volume,
      consumable  : session.consumable
    };
  }

  return service;
}
