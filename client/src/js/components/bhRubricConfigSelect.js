angular.module('bhima.components')
  .component('bhRubricConfigSelect', {
    templateUrl : 'modules/templates/bhRubricConfigSelect.tmpl.html',
    controller  : RubricConfigSelectController,
    transclude  : true,
    bindings    : {
      rubricConfigId : '<',
      onSelectCallback : '&',
      required : '<?',
    },
  });

RubricConfigSelectController.$inject = [
  'ConfigurationService', 'NotifyService',
];

/**
 * Rubric Config Select Controller
 *
 */
function RubricConfigSelectController(rubricConfigs, Notify) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {    

    rubricConfigs.read()
      .then(function (rubricConfigs) {
        $ctrl.rubricConfigs = rubricConfigs;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item) {
    $ctrl.onSelectCallback({ rubricConfig : $item });
  };
}