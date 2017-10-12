angular.module('bhima.components')
  .component('bhTransactionType', {
    templateUrl : 'modules/templates/bhTransactionType.tmpl.html',
    controller  : transactionTypeController,
    transclude  : true,
    bindings    : {
      typeId           : '<',
      disable          : '<?',
      onSelectCallback : '&',
      name             : '@?',
      required         : '<?',      
    },
  });

transactionTypeController.$inject = [
  'TransactionTypeService', 'NotifyService', '$translate'
];

/**
 * Transaction Type component
 *
 */
function transactionTypeController(TransactionTypes, Notify, $translate) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {    
    // fired when a transaction type has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // default for form name
    $ctrl.name = $ctrl.name || 'FORM.LABELS.TRANSACTION_TYPE';

    TransactionTypes.read()
      .then(function (tts) {
        tts.forEach(function (item) {
          item.hrText = $translate.instant(item.text);
        });
        $ctrl.types = tts;
      })
      .catch(Notify.handleError);

    $ctrl.valid = true;

  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item, $model) {
    $ctrl.onSelectCallback({ type : $item });
  };
}