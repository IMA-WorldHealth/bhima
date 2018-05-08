angular.module('bhima.components')
  .component('bhFiscalYearSelect', {
    bindings : {
      onSelectFiscalCallback : '&',
      fiscalId : '<?',
      validationTrigger : '<?',
    },
    templateUrl : 'modules/templates/bhFiscalYearSelect.tmpl.html',
    controller : FiscalYearSelect,
  });

FiscalYearSelect.$inject = ['FiscalService'];

function FiscalYearSelect(FiscalYears) {
  const $ctrl = this;

  $ctrl.$onInit = () => {
    FiscalYears.read()
      .then(years => {
        $ctrl.years = years;
      });
  };

  $ctrl.onChange = fiscalId => {
    $ctrl.onSelectFiscalCallback({ fiscalId });
  };
}
