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
  };

  service.openEditLot = openEditLot;
  service.openSearchLots = openSearchLots;
  service.openSearchStockAssign = openSearchStockAssign;
  service.openSearchMovements = openSearchMovements;
  service.openSearchInventories = openSearchInventories;
  service.openSearchDepots = openSearchDepots;
  service.openFindPatient = openFindPatient;
  service.openFindService = openFindService;
  service.openFindDepot = openFindDepot;
  service.openFindPurchase = openFindPurchase;
  service.openDefineLots = openDefineLots;
  service.openFindTansfer = openFindTansfer;
  service.openActionStockAssign = openActionStockAssign;
  service.openAssignmentHistoric = openAssignmentHistoric;

  /** create stock assign */
  function openActionStockAssign(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/stock/assign/modals/action.modal.html',
      controller   : 'ActionAssignModalController',
      controllerAs : '$ctrl',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  /** edit lot */
  function openEditLot(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/stock/lots/modals/edit.modal.html',
      controller   : 'EditLotModalController',
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
      controllerAs : '$ctrl',
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
      controllerAs : '$ctrl',
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
      controllerAs : '$ctrl',
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
      controllerAs : '$ctrl',
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
      controllerAs : '$ctrl',
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
      controllerAs : '$ctrl',
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
      controllerAs : '$ctrl',
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
      controllerAs : '$ctrl',
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
      controllerAs : '$ctrl',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  /** search transfer  */
  function openFindTansfer(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/stock/entry/modals/findTransfer.modal.html',
      controller   : 'StockFindTransferModalController',
      controllerAs : '$ctrl',
      resolve      : {
        data : () => request,
      },
    });

    const instance = Modal.open(params);
    return instance.result;
  }

  function openDefineLots(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/stock/entry/modals/lots.modal.html',
      controller   : 'StockDefineLotsModalController',
      controllerAs : '$ctrl',
      size         : 'lg',
      resolve      : { data : () => request },
    });

    const instance = Modal.open(params);
    return instance.result;
  }
}
