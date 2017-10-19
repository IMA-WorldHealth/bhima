angular.module('bhima.components')
.component('bhFiscalYearSelect', {
    bindings: {
      validationTrigger: '<',
      onSelectFiscalCallback: '&',
    },
    templateUrl: 'modules/templates/bhFiscalYearSelect.tmpl.html',
    controller: FiscalYearSelect,
});

FiscalYearSelect.$inject = ['FiscalService', '$translate'];

function FiscalYearSelect(Fiscals, $translate) {
  var $ctrl = this;

  Fiscals.read().then(function (fiscals) {
    $ctrl.fiscals = fiscals;
  });
  
  $ctrl.loadPeriod = function (fiscal_id) {
    $ctrl.onSelectFiscalCallback({ fiscal: fiscal_id });
  }

}