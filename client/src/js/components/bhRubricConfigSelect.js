angular.module('bhima.components')
  .component('bhRubricConfigSelect', {
    templateUrl : 'modules/templates/bhRubricConfigSelect.tmpl.html',
    controller  : RubricConfigSelectController,
    transclude  : true,
    bindings    : {
      configRubricId : '<',
      onSelectCallback : '&',
      required         : '<?',
      label            : '@?',
      name             : '@?',
      validationTrigger :  '<?',
    },
  });

RubricConfigSelectController.$inject = [
  'ConfigurationService', '$timeout', '$scope', 'NotifyService',
];

/**
 * Rubric Configuration Select Controller
 */
function RubricConfigSelectController(RubricConfigs, $timeout, $scope, Notify) {
  const $ctrl = this;

  // fired at the beginning of the rubric configuration select
  $ctrl.$onInit = function $onInit() {
    // translated label for the form input
    $ctrl.label = $ctrl.label || 'PAYROLL_RUBRIC.CONFIGURATION';

    // fired when an rubric configuration has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // default for form name
    $ctrl.name = $ctrl.name || 'RubricConfigForm';

    if (!angular.isDefined($ctrl.required)) {
      $ctrl.required = true;
    }

    RubricConfigs.read()
      .then(rubricConfigs => {
        $ctrl.rubricConfigs = rubricConfigs;
      })
      .catch(Notify.handleError);


    // alias the name as RubricConfigForm
    $timeout(aliasComponentForm);
  };

  // this makes the HTML much more readable by reference RubricConfigForm instead of the name
  function aliasComponentForm() {
    $scope.RubricConfigForm = $scope[$ctrl.name];
  }

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function onSelect($item) {
    $ctrl.onSelectCallback({ rubricConfig : $item });

    // alias the RubricConfigForm name so that we can find it via filterFormElements
    $scope[$ctrl.name].$bhValue = $item.id;
  };
}
