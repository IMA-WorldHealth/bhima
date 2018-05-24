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
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    // label to display
    $ctrl.label = $ctrl.label || 'FORM.LABELS.TRANSACTION_TYPE';

    // init the model
    $ctrl.selectedTransactionTypes = $ctrl.transactionTypeIds || [];

    // load all Transaction types
    TransactionTypes.read()
      .then(tts => {
        tts.forEach(item => {
          item.plainText = $translate.instant(item.text);
        });

        $ctrl.transactionTypes = tts;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component
  $ctrl.handleChange = transactionTypes => $ctrl.onChange({ transactionTypes });
}
