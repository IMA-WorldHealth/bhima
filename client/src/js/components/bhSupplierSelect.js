angular.module('bhima.components')
  .component('bhSupplierSelect', {
    templateUrl : 'modules/templates/bhSupplierSelect.tmpl.html',
    controller  : SupplierSelectController,
    transclude  : true,
    bindings    : {
      supplierUuid     : '<',
      onSelectCallback : '&',
      label            : '@?',
      required         : '<?',
      validateTrigger  : '<?',      
    },
  });

SupplierSelectController.$inject = [
  'SupplierService', 'NotifyService'
];

/**
 * Supplier selection component
 *
 */
function SupplierSelectController(Suppliers, Notify) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {    
    // fired when an Supplier has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // default for label
    $ctrl.label = $ctrl.label || 'FORM.LABELS.SUPPLIER';

    // load all Suppliers
    Suppliers.read()
      .then(function (suppliers) {        
        $ctrl.suppliers = suppliers;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item, $model) {
    $ctrl.onSelectCallback({ supplier : $item });
  };
}
