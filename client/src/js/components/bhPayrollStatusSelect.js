angular.module('bhima.components')
  .component('bhPayrollStatusSelect', {
    templateUrl : 'modules/templates/bhPayrollStatusSelect.tmpl.html',
    controller  : PayrollStatusSelectController,
    bindings    : {
      onChange : '&',
      statusIds : '<?',
      label : '@?',
      required : '<?',
      validationTrigger : '<?',
    },
  });

PayrollStatusSelectController.$inject = [
  'PayrollConfigurationService', 'NotifyService', '$translate',
];

/**
 * purchase status Selection Component
 *
 */
function PayrollStatusSelectController(Payroll, Notify, $translate) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    // label to display
    $ctrl.label = $ctrl.label || 'FORM.LABELS.STATUS';

    // fired when a payroll status has been selected or removed from the list
    $ctrl.onChange = $ctrl.onChange;

    // init the model
    $ctrl.selectedPayrollStatus = $ctrl.statusIds || [];

    // load all Payroll status
    Payroll.paiementStatus()
      .then((status) => {
        status.forEach((item) => {
          item.plainText = $translate.instant(item.text);
        });
        $ctrl.paiementStatus = status;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component
  $ctrl.handleChange = function handleChange(models) {
    $ctrl.onChange({ paiementStatus : models });
  };
}
