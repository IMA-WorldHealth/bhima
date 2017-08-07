angular.module('bhima.components')
  .component('bhTransactionTypeSelect', {
    templateUrl : 'modules/templates/bhTransactionTypeSelect.tmpl.html',
    controller  : transactionTypeSelectController,
    bindings    : { 
      transactionTypes : '<?',
      label            : '@?',
      onSelectCallback : '&',
      onRemoveCallback : '&',
      formName         : '@?',
      required         : '<?',
    },
  });

transactionTypeSelectController.$inject = [
  'TransactionTypeService', 'NotifyService', '$translate'
];

/**
 * transaction type Selection Component
 *
 */
function transactionTypeSelectController(TransactionTypes, Notify, $translate) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {
    //label to display
    $ctrl.label = $ctrl.label || 'FORM.LABELS.TRANSACTION_TYPE';

    // fired when a transaction type has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // default for form name
    $ctrl.formName = $ctrl.formName || 'TransactionTypeForm';

    // init the model
    $ctrl.selectedTransactionTypes = $ctrl.transactionTypes;

    // load all Transaction types
    TransactionTypes.read()
      .then(function (tts) {
        tts.forEach(function(item){
          item.plainText = $translate.instant(item.text);
        });
        $ctrl.transactionTypes = tts;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component
  $ctrl.onSelect = function (models) {
    $ctrl.onSelectCallback({ transactionTypes : models });
  };

  $ctrl.onRemove = function (models) {
    $ctrl.onRemoveCallback({ transactionTypes : models });
  };
}
