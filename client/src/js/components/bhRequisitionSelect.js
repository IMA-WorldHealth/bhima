angular.module('bhima.components')
  .component('bhRequisitionSelect', {
    templateUrl : 'modules/templates/bhRequisitionSelect.tmpl.html',
    controller  : RequisitionSelectController,
    transclude  : true,
    bindings    : {
      requisitionUuid        : '<',
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
    Stock.stockRequisition.read()
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
