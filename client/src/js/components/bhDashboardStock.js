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
    $ctrl.required = $ctrl.required || false;

    if ($ctrl.status === 'expired') {
      $ctrl.display = 'fa fa-minus-circle icon-expired';
    } else if ($ctrl.status === 'out_of_stock') {
      $ctrl.display = 'fa fa-battery-empty icon-out-of-stock';
    } else if ($ctrl.status === 'at_risk_expiration') {
      $ctrl.display = 'fa fa-exclamation-triangle icon-at-risk-of-expiring';
    }

    StockDashBoard.read({ status : $ctrl.status })
      .then((data) => {
        console.log('VOICI LES DONNEEEEeeeeeeeee');
        console.log(data);

        


        $ctrl.data = data;
      })
      .catch(Notify.handleError);
  };
}
