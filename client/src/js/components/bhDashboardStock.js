angular.module('bhima.components')
  .component('bhDashboardStock', {
    templateUrl : 'modules/templates/bhDashboardStock.tmpl.html',
    controller  : DashboardStock,
    transclude  : true,
    bindings    : {
      status  : '@?',
      label   : '@?',
    },
  });

DashboardStock.$inject = [
  'StockDashBoardService', 'NotifyService',
];

/**
 * Dashboard Stock Controller
 *
 */
function DashboardStock(StockDashBoard, Notify) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    $ctrl.loading = true;

    if ($ctrl.status === 'expired') {
      $ctrl.display = 'fa fa-minus-circle icon-expired';
      $ctrl.keyLotFilter = 'is_expired';

    } else if ($ctrl.status === 'out_of_stock') {
      $ctrl.display = 'fa fa-battery-empty icon-out-of-stock';
      $ctrl.keyInventoryFilter = 'stock_out';
      $ctrl.label = 'STOCK.STATUS.STOCK_OUT';

    } else if ($ctrl.status === 'at_risk_expiration') {
      $ctrl.display = 'fa fa-exclamation-triangle icon-at-risk-of-expiring';
      $ctrl.keyLotFilter = 'is_expiry_risk';

    } else if ($ctrl.status === 'at_risk_out_stock') {
      $ctrl.display = 'fa fa-battery-quarter icon-out-of-stock';
      $ctrl.keyInventoryFilter = 'security_reached';
      $ctrl.label = 'STOCK.STATUS.SECURITY';

    } else if ($ctrl.status === 'over_max') {
      $ctrl.display = 'fa fa-minus-square text-info';
      $ctrl.keyInventoryFilter = 'over_maximum';
      $ctrl.label = 'STOCK.STATUS.OVER_MAX';

    } else if ($ctrl.status === 'require_po') {
      $ctrl.display = 'fa fa-shopping-cart text-success';
      $ctrl.keyInventoryFilter = 'require_po';
      $ctrl.label = 'STOCK.REQUIRES_PO';
    } else if ($ctrl.status === 'minimum_reached') {
      $ctrl.display = 'fa fa-battery-quarter text-info';
      $ctrl.keyInventoryFilter = 'minimum_reached';
      $ctrl.label = 'STOCK.STATUS.MINIMUM';

    }

    StockDashBoard.read({ status : $ctrl.status })
      .then((data) => {
        $ctrl.loading = false;
        $ctrl.stockNotFound = !data.length;

        data.forEach(element => {
          if (($ctrl.status === 'expired') || ($ctrl.status === 'at_risk_expiration')) {
            element.ahref = `stockLots({ filters : [
              { key : 'period', value : 'allTime'},
              { key : 'depot_uuid', value : '${element.depot_uuid}',
                displayValue: '${element.depot_text}',
                cacheable:false },
              { key : 'includeEmptyLot', value : 0 },
              { key : '${$ctrl.keyLotFilter}', value : 1, cacheable:false }
            ]})`;
          } else if ($ctrl.status === 'require_po') {
            element.ahref = `stockInventories({ filters : [
              { key : 'period', value : 'allTime'},
              { key : 'includeEmptyLot', value : 1 },
              { key           : 'depot_uuid',
                value         : '${element.depot_uuid}',
                displayValue  : '${element.depot_text}',
                cacheable     : false },
              {
                key : 'require_po', value : 1,
                cacheable : false
              }
            ]})`;
          } else {
            element.ahref = `stockInventories({ filters : [
              { key : 'period', value : 'allTime'},
              { key : 'includeEmptyLot', value : 1 },
              { key           : 'depot_uuid',
                value         : '${element.depot_uuid}',
                displayValue  : '${element.depot_text}',
                cacheable     : false },
              {
                key : 'status', value : '${$ctrl.keyInventoryFilter}',
                displayValue : '${$ctrl.label}',
                cacheable : false
              }
            ]})`;
          }
        });

        $ctrl.data = data;
      })
      .catch(Notify.handleError);
  };
}
