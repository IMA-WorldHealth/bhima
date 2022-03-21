angular.module('bhima.services')
  .service('StockModalService', StockModalService);

StockModalService.$inject = ['$uibModal'];

// service definition
function StockModalService(Modal) {
  const service = this;

  const modalParameters = {
    size      : 'md',
    backdrop  : 'static',
    animation : false,
    controllerAs : '$ctrl',
  };

  service.openAMCCalculationModal = openAMCCalculationModal;
  service.openActionStockAssign = openActionStockAssign;
  service.openActionStockRequisition = openActionStockRequisition;
  service.openAssetEdit = openAssetEdit;
  service.openAssetScanEdit = openAssetScanEdit;
  service.openAssetScansSearch = openAssetScansSearch;
  service.openAssetsSearch = openAssetsSearch;
  service.openAssignmentHistoric = openAssignmentHistoric;
  service.openConsumptionByLots = openConsumptionByLots;
  service.openDefineLots = openDefineLots;
  service.openDuplicateLotsModal = openDuplicateLotsModal;
  service.openEditLot = openEditLot;
  service.openFindDepot = openFindDepot;
  service.openFindPatient = openFindPatient;
  service.openFindPurchase = openFindPurchase;
  service.openFindService = openFindService;
  service.openFindTransfer = openFindTransfer;
  service.openGenerateAssetBarcodes = openGenerateAssetBarcodes;
  service.openLotScheduleModal = openLotScheduleModal;
  service.openSearchDepots = openSearchDepots;
  service.openSearchInventories = openSearchInventories;
  service.openSearchLots = openSearchLots;
  service.openSearchMovements = openSearchMovements;
  service.openSearchStockAssign = openSearchStockAssign;
  service.openSearchStockRequisition = openSearchStockRequisition;

  // generate tag numbers
  function openGenerateAssetBarcodes(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/stock/entry/modals/generateAssetTags.modal.html',
      controller   : 'GenerateTagsModalController',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  /** create stock assign */
  function openActionStockAssign(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/assets/modals/assign.modal.html',
      controller   : 'AssetAssignmentModalController',
      controllerAs : '$ctrl',
      resolve      : {
        data : () => request,
        params : request,
      },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  /** edit lot */
  function openEditLot(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/stock/lots/modals/edit.modal.html',
      controller   : 'EditLotModalController',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  /** edit asset */
  function openAssetEdit(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/assets/modals/edit.modal.html',
      controller   : 'AssetEditModalController',
      controllerAs : '$ctrl',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  /** edit asset */
  function openAssetScanEdit(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/asset_scans/modals/edit.modal.html',
      controller   : 'AssetScanEditModalController',
      controllerAs : '$ctrl',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  /** open assign historic */
  function openAssignmentHistoric(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/stock/lots/modals/historic.modal.html',
      controller   : 'HistoricModalController',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  /** search assets */
  function openAssetsSearch(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/assets/modals/search.modal.html',
      controller   : 'AssetsSearchModalController',
      controllerAs : '$ctrl',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  /** search assets */
  function openAssetScansSearch(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/asset_scans/modals/search.modal.html',
      controller   : 'AssetScansSearchModalController',
      controllerAs : '$ctrl',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  /** search stock lots */
  function openSearchLots(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/stock/lots/modals/search.modal.html',
      controller   : 'SearchLotsModalController',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  /** duplicate lots */
  function openDuplicateLotsModal(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/stock/lots/modals/duplicates.modal.html',
      controller   : 'DuplicateLotsModalController',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  /** show schedule for lots consumption */
  function openLotScheduleModal(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/stock/lots/modals/schedule.modal.html',
      controller   : 'LotsScheduleModalController',
      size         : 'lg',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  /** search stock assign */
  function openSearchStockAssign(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/stock/assign/modals/search.modal.html',
      controller   : 'SearchStockAssignModalController',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  /** create stock requisition */
  function openActionStockRequisition(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/stock/requisition/modals/action.modal.html',
      controller   : 'ActionRequisitionModalController',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  /** search stock requisition */
  function openSearchStockRequisition(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/stock/requisition/modals/search.modal.html',
      controller   : 'SearchStockRequisitionModalController',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  /** search stock movement */
  function openSearchMovements(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/stock/movements/modals/search.modal.html',
      controller   : 'SearchMovementsModalController',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  /** search depots */
  function openSearchDepots(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/depots/modals/search.modal.html',
      controller   : 'SearchDepotModalController',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  /** search stock inventory */
  function openSearchInventories(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/stock/inventories/modals/search.modal.html',
      controller   : 'SearchInventoriesModalController',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  /** search patient  */
  function openFindPatient(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/stock/exit/modals/findPatient.modal.html',
      controller   : 'StockFindPatientModalController',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  /** search service  */
  function openFindService(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/stock/exit/modals/findService.modal.html',
      controller   : 'StockFindServiceModalController',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  /** search depot  */
  function openFindDepot(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/stock/exit/modals/findDepot.modal.html',
      controller   : 'StockFindDepotModalController',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  /** search purchase  */
  function openFindPurchase(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/stock/entry/modals/findPurchase.modal.html',
      controller   : 'StockFindPurchaseModalController',
      resolve      : { data : () => request },
    });
    const instance = Modal.open(params);
    return instance.result;
  }

  /** search transfer  */
  function openFindTransfer(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/stock/entry/modals/findTransfer.modal.html',
      controller   : 'StockFindTransferModalController',
      resolve      : {
        data : () => request,
      },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  function openAMCCalculationModal(request) {
    const templateUrl = 'modules/stock/inventories/modals/amc.modal.html';
    const controller = 'StockAMCModalController';

    const params = angular.extend(modalParameters, {
      templateUrl,
      controller,
      controllerAs : 'ModalCtrl',
      size         : 'lg',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  function openDefineLots(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/stock/entry/modals/lots.modal.html',
      controller   : 'StockDefineLotsModalController',
      size         : 'lg',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  function openConsumptionByLots(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/stock/aggregated_consumption/modals/consumption_lot.modal.html',
      controller   : 'StockConsumptionLotsModalController',
      size         : 'lg',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }
}
