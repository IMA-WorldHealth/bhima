angular.module('bhima.components')
.component('bhPeriodDropdown', {
  bindings : {
    defaultPeriod : '@',
    onSelectCallback : '&',
  },
  templateUrl : 'modules/templates/bhPeriodDropdown.tmpl.html',
  controller : PeriodDropdown,
  controllerAs : '$ctrl',
});

// Dependencies Injections
PeriodDropdown.$inject = ['PeriodService', 'bhConstants', 'ModalService'];

/**
 * component - bhPeriodDropdown
 * This component is for having a dropdown button for selecting periods
 * @example
 * <bh-period-dropdown
 *  default-period="{{$ctrl.filters.period}}"
 *  on-select-callback="$ctrl.onSelectPeriod(period)">
 * </bh-period-dropdown>
 */
function PeriodDropdown(Periods, bhConstants, Modal) {
  var ctrl = this;

  ctrl.Periods = Periods;
  ctrl.dateFormat = bhConstants.dates.format;

  ctrl.$onInit = function onInit() {
    ctrl.periodKey = ctrl.defaultPeriod || Periods.index.today.key;
    ctrl.period = Periods.definition(ctrl.periodKey);
  };

  ctrl.selectPeriod = function selectPeriod(key) {
    var period = Periods.definition(key);
    ctrl.onSelectCallback({ period : period });
    ctrl.period = period;
  };

  ctrl.selectCustomPeriod = function selectCustomPeriod() {
    Modal.openDateInterval()
    .then(function (selection) {
      var period = Periods.index.custom;

      period.customPeriodStart = selection.dateFrom;
      period.customPeriodEnd = selection.dateTo;

      ctrl.onSelectCallback({ period : period });
      ctrl.period = period;
    });
  };
}
