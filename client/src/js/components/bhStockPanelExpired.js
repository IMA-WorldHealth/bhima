angular.module('bhima.components')
  .component('bhStockPanelExpired', {
    templateUrl : 'modules/templates/bhStockPanelExpired.tmpl.html',
    controller  : StockPanelExpiredController,
    transclude  : true,
    bindings    : {
      label   : '@?',
    },
  });

StockPanelExpiredController.$inject = [
  'StockDashBoardService', 'NotifyService',
];

/**
 * Stock Panel Expired Controller
 *
 */
function StockPanelExpiredController(StockDashBoard, Notify) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    $ctrl.loading = true;
    $ctrl.display = 'fa fa-minus-circle icon-expired';

    StockDashBoard.read({ status : $ctrl.status })
      .then((data) => {
        $ctrl.loading = false;
        $ctrl.stockNotFound = !data.length;

        data.forEach(element => {
          element.ahref = `stockLots({ filters : [
            { key : 'period', value : 'allTime'},
            { key : 'depot_uuid', value : '${element.depot_uuid}',
              displayValue: '${element.depot_text}',
              cacheable:false },
            { key : 'includeEmptyLot', value : 0 },
            { key : 'is_expired', value : 1, cacheable:false }
          ]})`;
        });

        $ctrl.data = data;
      })
      .catch(Notify.handleError);
  };
}
