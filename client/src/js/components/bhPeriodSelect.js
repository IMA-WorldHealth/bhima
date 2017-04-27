angular.module('bhima.components')
.component('bhPeriodSelect', {
  bindings : {
    defaultPeriod : '@',
    onSelectCallback : '&'
  },
  templateUrl : 'modules/templates/bhPeriodSelect.tmpl.html',
  controller : PeriodSelect
});

PeriodSelect.$inject = ['PeriodService'];

function PeriodSelect(Periods) {
  var ctrl = this;
  var DEFAULT_PERIOD = 'today';

  ctrl.NO_PERIOD_LIMIT_KEY = 'allTime';
  ctrl.CUSTOM_PERIOD_KEY = 'custom';

  ctrl.expanded = false;
  ctrl.customExpanded = false;

  ctrl.Periods = Periods;

  ctrl.customSelection = {
    from : new Date(),
    to : new Date()
  };

  ctrl.$onInit = function onInit() {
    ctrl.periodKey = ctrl.defaultPeriod || DEFAULT_PERIOD;
    ctrl.period = Periods.definition(ctrl.periodKey);
  };

  ctrl.toggleSelectionOptions = function toggleSelectionOptions() {
    ctrl.expanded = !ctrl.expanded;
  };

  ctrl.toggleCustomSelection = function toggleCustomSelection() {
    ctrl.customExpanded = !ctrl.customExpanded;
  };

  ctrl.selectPeriod = function selectPeriod(key) {
    var period = Periods.definition(key);
    ctrl.onSelectCallback({ period : period });
    ctrl.toggleSelectionOptions();

    ctrl.period = period;
  };

  ctrl.selectCustomPeriod = function selectCustomPeriod(selection) {
    var period = Periods.index.custom;

    // alias start and
    period.customPeriodStart = selection.from;
    period.customPeriodEnd = selection.to;

    ctrl.onSelectCallback({ period : period });
    ctrl.toggleSelectionOptions();

    ctrl.period = period;
  };
}
