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
}