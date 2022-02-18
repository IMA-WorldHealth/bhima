angular.module('bhima.services')
  .service('ShipmentModalService', ShipmentModalService);

ShipmentModalService.$inject = ['$uibModal', 'ReceiptService'];

// service definition
function ShipmentModalService(Modal, Receipts) {
  const service = this;

  const modalParameters = {
    size      : 'md',
    backdrop  : 'static',
    animation : false,
  };

  const receiptModalParameters = {
    templateUrl : '/js/services/receipts/modal/receiptModal.tmpl.html',
    controller  : 'ReceiptModalController as ReceiptCtrl',
    size        : 'lg',
    backdrop    : 'static',
    animation   : false,
  };

  service.openSearchShipment = openSearchShipment;
  service.openShipmentOverview = openShipmentOverview;

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

  function openShipmentOverview(documentUuid, notifyCreated) {
    const opts = { title : 'SHIPMENT.OVERVIEW', notifyCreated, renderer : Receipts.renderer };
    const promise = Receipts.shipmentOverview(documentUuid, { renderer : opts.renderer });
    return ReceiptFactory(promise, opts);
  }

  /**
   * @method ReceiptFactory
   * @description A factory for receipts
   */
  function ReceiptFactory(promise, options) {
    const defaults = {
      renderer : Receipts.renderer,
      notifyCreated : false,
    };

    const parameters = angular.extend(defaults, options);
    const provider = {
      resolve :  {
        receipt : function receiptProvider() { return { promise }; },
        options : function optionsProvider() { return parameters; },
        document : function documentProvider() { return {}; },
      },
    };

    const configuration = angular.extend(receiptModalParameters, provider);
    const instance = Modal.open(configuration);
    return instance.result;
  }
}
