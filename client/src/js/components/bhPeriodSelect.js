angular.module('bhima.components')
.component('bhPeriodSelect', {
  bindings : {
    defaultPeriod : '@',
    onSelectCallback : '&'
  },
  templateUrl : 'partials/templates/bhPeriodSelect.tmpl.html',
  controller : PeriodSelect
});

PeriodSelect.$inject = ['PeriodService'];

function PeriodSelect(Periods) {
  var ctrl = this;
  var DEFAULT_PERIOD = 'today';

  ctrl.NO_PERIOD_LIMIT_KEY = 'allTime';

  ctrl.expanded = false;

  ctrl.Periods = Periods;

  ctrl.$onInit = function onInit() {
    ctrl.periodKey = ctrl.defaultPeriod || DEFAULT_PERIOD;
    ctrl.period = Periods.definition(ctrl.periodKey);
  }

  ctrl.toggleSelectionOptions = function toggleSelectionOptions() {
    ctrl.expanded = !ctrl.expanded;
  }
  ctrl.selectPeriod = function selectPeriod(key) {
    ctrl.onSelectCallback({ key : key});
    ctrl.toggleSelectionOptions();

    ctrl.period = Periods.definition(key);
  }
}
