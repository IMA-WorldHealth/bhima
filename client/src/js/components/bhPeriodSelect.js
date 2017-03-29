angular.module('bhima.components')
.component('bhPeriodSelect', {
  bindings : {
    onSelectCallback : '&'
  },
  templateUrl : 'partials/templates/bhPeriodSelect.tmpl.html',
  controller : PeriodSelect
});

PeriodSelect.$inject = ['PeriodService'];

function PeriodSelect(Periods) {
  var ctrl = this;

  ctrl.expanded = false;

  ctrl.Periods = Periods;

  ctrl.toggleSelectionOptions = function toggleSelectionOptions() {
    ctrl.expanded = !ctrl.expanded;
  }
  ctrl.selectPeriod = function selectPeriod(key) {
    ctrl.onSelectCallback({ key : key});
    ctrl.toggleSelectionOptions();
  }
}
