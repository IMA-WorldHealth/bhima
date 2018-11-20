angular.module('bhima.components')
  .component('bhWeekendConfigSelect', {
    templateUrl : 'modules/templates/bhWeekendConfigSelect.tmpl.html',
    controller  : WeekConfigSelectController,
    transclude  : true,
    bindings    : {
      configWeekId : '<',
      onSelectCallback : '&',
      label            : '@?',
      required         : '<?',
    },
  });

WeekConfigSelectController.$inject = [
  'ConfigurationWeekendService', 'NotifyService',
];

/**
 * Week Configuration Select Controller
 */
function WeekConfigSelectController(WeekConfigs, Notify) {
  const $ctrl = this;

  // fired at the beginning of the weekend configuration select
  $ctrl.$onInit = function $onInit() {
    // translated label for the form input
    $ctrl.label = $ctrl.label || 'FORM.LABELS.WEEKEND_CONFIGURATION';


    if (!angular.isDefined($ctrl.required)) {
      $ctrl.required = true;
    }

    WeekConfigs.read()
      .then(weekendConfigs => {
        $ctrl.weekendConfigs = weekendConfigs;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = weekendConfig => {
    $ctrl.onSelectCallback({ weekendConfig });
  };
}
