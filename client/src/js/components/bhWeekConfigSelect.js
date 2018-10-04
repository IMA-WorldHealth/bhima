angular.module('bhima.components')
  .component('bhWeekendConfigSelect', {
    templateUrl : 'modules/templates/bhWeekendConfigSelect.tmpl.html',
    controller  : WeekConfigSelectController,
    transclude  : true,
    bindings    : {
      configWeekId : '<',
      onSelectCallback : '&',
      required         : '<?',
      label            : '@?',
      name             : '@?',
      validationTrigger :  '<?',
    },
  });

WeekConfigSelectController.$inject = [
  'ConfigurationWeekEndService', '$timeout', '$scope', 'NotifyService',
];

/**
 * Week Configuration Select Controller
 */
function WeekConfigSelectController(WeekConfigs, $timeout, $scope, Notify) {
  const $ctrl = this;

  // fired at the beginning of the weekend configuration select
  $ctrl.$onInit = function $onInit() {
    // translated label for the form input
    $ctrl.label = $ctrl.label || 'FORM.LABELS.WEEKEND_CONFIGURATION';

    // fired when an weekend configuration has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // default for form name
    $ctrl.name = $ctrl.name || 'WeekConfigForm';


    if (!angular.isDefined($ctrl.required)) {
      $ctrl.required = true;
    }

    WeekConfigs.read()
      .then(weekendConfigs => {
        $ctrl.weekendConfigs = weekendConfigs;
      })
      .catch(Notify.handleError);


    // alias the name as WeekConfigForm
    $timeout(aliasComponentForm);
  };

  // this makes the HTML much more readable by reference WeekConfigForm instead of the name
  function aliasComponentForm() {
    $scope.WeekConfigForm = $scope[$ctrl.name];
  }

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function onSelect($item) {
    $ctrl.onSelectCallback({ weekendConfig : $item });

    // alias the WeekConfigForm name so that we can find it via filterFormElements
    $scope[$ctrl.name].$bhValue = $item.id;
  };
}
