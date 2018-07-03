angular.module('bhima.components')
  .component('bhFiscalYearSelect', {
    templateUrl : 'modules/templates/bhFiscalYearSelect.tmpl.html',
    controller : FiscalYearSelect,
    bindings : {
      onSelectFiscalCallback : '&',
      fiscalId : '<?',
      validationTrigger : '<?',
    },
  });

FiscalYearSelect.$inject = ['FiscalService'];

function FiscalYearSelect(FiscalYears) {
  const $ctrl = this;

  $ctrl.$onInit = () => {
    FiscalYears.read()
      .then(years => {
        $ctrl.years = years;
        [$ctrl.selectedYear] = years.filter(id => id === $ctrl.fiscalId);
      });
  };

  $ctrl.onChange = fiscalYear => {
    $ctrl.onSelectFiscalCallback({ fiscalYear });
  };
}
