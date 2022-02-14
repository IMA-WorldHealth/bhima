angular.module('bhima.services')
  .service('ShipmentService', ShipmentService);

ShipmentService.$inject = ['PrototypeApiService'];

function ShipmentService(Api) {
  const service = new Api('/shipments/');

  service.statusLabel = {
    1 : 'ASSET.STATUS.EMPTY',
    2 : 'ASSET.STATUS.PARTIAL',
    3 : 'ASSET.STATUS.COMPLETE',
    4 : 'ASSET.STATUS.IN_TRANSIT',
    5 : 'ASSET.STATUS.AT_DEPOT',
    6 : 'ASSET.STATUS.DELIVERED',
    7 : 'ASSET.STATUS.LOST',
  };

  return service;
}
