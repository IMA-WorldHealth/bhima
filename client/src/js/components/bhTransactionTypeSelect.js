angular.module('bhima.components')
  .component('bhTransactionTypeSelect', {
    templateUrl : 'modules/templates/bhTransactionTypeSelect.tmpl.html',
    controller  : transactionTypeSelectController,
    bindings    : {
      onChange : '&',
      transactionTypeIds : '<?',
      label : '@?',
      required : '<?',
      validationTrigger : '<?',
    },
  });

transactionTypeSelectController.$inject = [
  'TransactionTypeService', 'NotifyService', '$translate',
];

/**
 * transaction type Selection Component
 *
 */
function transactionTypeSelectController(TransactionTypes, Notify, $translate) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {
    // label to display
    $ctrl.label = $ctrl.label || 'FORM.LABELS.TRANSACTION_TYPE';

    // fired when a transaction type has been selected or removed from the list
    $ctrl.onChange = $ctrl.onChange || angular.noop;

    // init the model
    $ctrl.selectedTransactionTypes = $ctrl.transactionTypeIds || [];

    // load all Transaction types
    TransactionTypes.read()
      .then(function (tts) {
        tts.forEach(function (item) {
          item.plainText = $translate.instant(item.text);
        });
        $ctrl.transactionTypes = tts;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component
  $ctrl.handleChange = function (models) {
    $ctrl.onChange({ transactionTypes : models });
  };
}
