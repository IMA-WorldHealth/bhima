angular.module('bhima.components')
  .component('bhRequisitionSelect', {
    templateUrl : 'modules/templates/bhRequisitionSelect.tmpl.html',
    controller  : RequisitionSelectController,
    transclude  : true,
    bindings    : {
      requisitionUuid : '<',
      depotUuid : '<',
      serviceUuid : '<',
      onSelectCallback : '&',
      required : '@?',
      label : '@?',
    },
  });

RequisitionSelectController.$inject = [
  'StockService', 'NotifyService',
];

/**
 * Requisition Select Controller
 *
 */
function RequisitionSelectController(Stock, Notify) {
  const $ctrl = this;
  $ctrl.label = $ctrl.label || 'FORM.LABELS.REQUISITION_REFERENCE';
  $ctrl.$onInit = function onInit() {
    $ctrl.required = $ctrl.required || false;
    const params = {};

    if ($ctrl.depotUuid) {
      params.requestor_uuid = $ctrl.depotUuid;
    }

    if ($ctrl.serviceUuid) {
      params.requestor_uuid = $ctrl.serviceUuid;
    }

    Stock.stockRequisition.read(null, params)
      .then((requisitions) => {
        $ctrl.requisitions = requisitions;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = ($item) => {
    $ctrl.onSelectCallback({ requisition : $item });
  };
}
