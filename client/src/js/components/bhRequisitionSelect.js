angular.module('bhima.components')
  .component('bhRequisitionSelect', {
    templateUrl : 'modules/templates/bhRequisitionSelect.tmpl.html',
    controller  : RequisitionSelectController,
    transclude  : true,
    bindings    : {
      requisitionUuid : '<',
      requestorUuid : '<?',
      onSelectCallback : '&',
      allowCompleted : '@?',
      required : '@?',
      label : '@?',
      disabled : '<?',
    },
  });

RequisitionSelectController.$inject = [
  'StockService', 'NotifyService', 'bhConstants',
];

/**
 * Requisition Select Controller
 *
 */
function RequisitionSelectController(Stock, Notify, bhConstants) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    $ctrl.label = $ctrl.label || 'FORM.LABELS.REQUISITION_REFERENCE';
    $ctrl.required = $ctrl.required || false;

    const params = {};
    params.requestor_uuid = $ctrl.requestorUuid;

    $ctrl.allowCompleted = false;

    Stock.stockRequisition.read(null, params)
      .then((requisitions) => {
        const allowCompleted = $ctrl.allowCompleted !== 'false';
        $ctrl.requisitions = allowCompleted
          ? requisitions
          : requisitions.filter(req => req.status_id !== bhConstants.stockRequisition.completed_status);
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = ($item) => {
    $ctrl.onSelectCallback({ requisition : $item });
  };
}
