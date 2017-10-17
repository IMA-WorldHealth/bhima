angular.module('bhima.components')
  .component('bhPurchaseStatusSelect', {
    templateUrl : 'modules/templates/bhPurchaseStatusSelect.tmpl.html',
    controller  : PurchaseStatusSelectController,
    bindings    : {
      onChange : '&',
      statusId : '<?',
      label : '@?',
      required : '<?',
      validationTrigger : '<?',
    },
  });

PurchaseStatusSelectController.$inject = [
  'PurchaseOrderService', 'NotifyService', '$translate',
];

/**
 * purchase status Selection Component
 *
 */
function PurchaseStatusSelectController(PurchaseOrder, Notify, $translate) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {
    // label to display
    $ctrl.label = $ctrl.label || 'FORM.LABELS.STATUS';

    // fired when a purchase status has been selected or removed from the list
    $ctrl.onChange = $ctrl.onChange || angular.noop;

    // init the model
    $ctrl.selectedPurchaseStatus = $ctrl.statusId || [];

    // load all Purchase status
    PurchaseOrder.purchaseState()
      .then(function (status) {
        status.forEach(function (item) {
          item.plainText = $translate.instant(item.text);
        });
        $ctrl.purchaseStatus = status;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component
  $ctrl.handleChange = function (models) {
    $ctrl.onChange({ purchaseStatus : models });
  };
}
