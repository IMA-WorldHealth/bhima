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

  service.shipmentDocumentModal = shipmentDocumentModal;
  service.setReadyForShipmentModal = setReadyForShipmentModal;
  service.updateTrackingLogModal = updateTrackingLogModal;
  service.setShipmentDeliveredModal = setShipmentDeliveredModal;
  service.setShipmentCompletedModal = setShipmentCompletedModal;

  service.openSearchShipment = openSearchShipment;
  service.openShipmentDocument = openShipmentDocument;
  service.openShipmentManifest = openShipmentManifest;
  service.openShipmentBarcode = openShipmentBarcode;

  service.openEditContainerModal = openEditContainerModal;

  // modal on the client callable from anywhere
  function shipmentDocumentModal(uuid) {
    Modal.open({
      size : 'lg',
      templateUrl : 'modules/shipment/modals/shipment-document.modal.html',
      controller : 'ShipmentDocumentModalController as $ctrl',
      resolve : { params : () => ({ uuid }) },
    }).result.catch(angular.noop);
  }

  function setReadyForShipmentModal(uuid) {
    return Modal.open({
      templateUrl : 'modules/shipment/modals/ready-for-shipment.modal.html',
      controller : 'ReadyForShipmentModalController as $ctrl',
      resolve : { params : () => ({ uuid }) },
    }).result.catch(angular.noop);
  }

  function updateTrackingLogModal(uuid) {
    Modal.open({
      size : 'lg',
      templateUrl : 'modules/shipment/modals/tracking-log.modal.html',
      controller : 'UpdateTrackingLogModalController as $ctrl',
      resolve : { params : () => ({ uuid }) },
    }).result.catch(angular.noop);
  }

  function setShipmentCompletedModal(uuid) {
    return Modal.open({
      templateUrl : 'modules/shipment/modals/shipment-completed.modal.html',
      controller : 'ShipmentCompletedModalController as $ctrl',
      resolve : { params : () => ({ uuid }) },
    }).result.catch(angular.noop);
  }

  function setShipmentDeliveredModal(uuid) {
    return Modal.open({
      templateUrl : 'modules/shipment/modals/shipment-delivered.modal.html',
      controller : 'ShipmentDeliveredModalController as $ctrl',
      resolve : { params : () => ({ uuid }) },
    }).result.catch(angular.noop);
  }

  // search shipment modal for receipts
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

  function openShipmentDocument(documentUuid, notifyCreated) {
    const opts = { title : 'SHIPMENT.SHIPMENT_DOCUMENT', notifyCreated, renderer : Receipts.renderer };
    const promise = Receipts.shipmentDocument(documentUuid, { renderer : opts.renderer });
    return ReceiptFactory(promise, opts);
  }

  function openShipmentManifest(documentUuid, notifyCreated) {
    const opts = { title : 'SHIPMENT.SHIPMENT_MANIFEST', notifyCreated, renderer : Receipts.renderer };
    const promise = Receipts.shipmentManifest(documentUuid, { renderer : opts.renderer });
    return ReceiptFactory(promise, opts);
  }

  function openShipmentBarcode(documentUuid, notifyCreated) {
    const opts = { title : 'BARCODE.BARCODE', notifyCreated, renderer : Receipts.renderer };
    const promise = Receipts.shipmentBarcode(documentUuid, { renderer : opts.renderer });
    return ReceiptFactory(promise, opts);
  }

  function openEditContainerModal(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/shipment/modals/edit-container.modal.html',
      controller   : 'ContainerEditModalController',
      controllerAs : '$ctrl',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
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
