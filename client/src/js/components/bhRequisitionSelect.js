angular.module('bhima.components')
  .component('bhRequisitionSelect', {
    templateUrl : 'modules/templates/bhRequisitionSelect.tmpl.html',
    controller  : RequisitionSelectController,
    transclude  : true,
    bindings    : {
      requisitionUuid : '<',
      requestorUuid : '<?',
      onSelectCallback : '&',
      required : '@?',
      label : '@?',
      disabled : '<?',
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

  $ctrl.$onInit = function onInit() {
    $ctrl.label = $ctrl.label || 'FORM.LABELS.REQUISITION_REFERENCE';
    $ctrl.required = $ctrl.required || false;

    const params = {};
    params.requestor_uuid = $ctrl.requestorUuid;

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
