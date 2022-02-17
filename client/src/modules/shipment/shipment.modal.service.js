angular.module('bhima.services')
  .service('ShipmentModalService', ShipmentModalService);

ShipmentModalService.$inject = ['$uibModal'];

// service definition
function ShipmentModalService(Modal) {
  const service = this;

  const modalParameters = {
    size      : 'md',
    backdrop  : 'static',
    animation : false,
  };

  service.openSearchShipment = openSearchShipment;

  // search shipment modal
  function openSearchShipment(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/shipment/modals/search.modal.html',
      controller   : 'SearchShipmentModalController',
      controllerAs : '$ctrl',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }
}
