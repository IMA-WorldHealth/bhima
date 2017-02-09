angular.module('bhima.services')
    .service('StockModalService', StockModalService);

// dependencies injection 
StockModalService.$inject = [ '$uibModal' ];

// service definition 
function StockModalService(Modal) {
    var service = this;

    var modalParameters = {
        size : 'md',
        backdrop : 'static',
        animation : false
    };

    service.openSearchLots = openSearchLots;
    service.openSearchMovements = openSearchMovements;
    service.openSearchInventories = openSearchInventories;

    /** search stock lots */
    function openSearchLots(request) {
      var params = angular.extend(modalParameters, {
        templateUrl  : 'partials/stock/lots/modals/search.modal.html',
        controller   : 'SearchLotsModalController',
        controllerAs : '$ctrl',
        size         : 'md',
        backdrop     : 'static',
        animation    : false,
        resolve : {
          data :  function dataProvider() { return request; }
        }
      });

      var instance = Modal.open(params);
      return instance.result;
    }

    /** search stock movement */
    function openSearchMovements(request) {
      var params = angular.extend(modalParameters, {
        templateUrl  : 'partials/stock/movements/modals/search.modal.html',
        controller   : 'SearchMovementsModalController',
        controllerAs : '$ctrl',
        size         : 'md',
        backdrop     : 'static',
        animation    : false,
        resolve : {
          data :  function dataProvider() { return request; }
        }
      });

      var instance = Modal.open(params);
      return instance.result;
    }

    /** search stock inventory */
    function openSearchInventories(request) {
      var params = angular.extend(modalParameters, {
        templateUrl  : 'partials/stock/inventories/modals/search.modal.html',
        controller   : 'SearchInventoriesModalController',
        controllerAs : '$ctrl',
        size         : 'md',
        backdrop     : 'static',
        animation    : false,
        resolve : {
          data :  function dataProvider() { return request; }
        }
      });

      var instance = Modal.open(params);
      return instance.result;
    }
}