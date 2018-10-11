angular.module('bhima.components')
  .component('bhIprConfigSelect', {
    templateUrl : 'modules/templates/bhIprConfigSelect.tmpl.html',
    controller  : IprConfigSelectController,
    transclude  : true,
    bindings    : {
      configIprId : '<',
      onSelectCallback : '&',
      required         : '<?',
      label            : '@?',
      name             : '@?',
      validationTrigger :  '<?',
    },
  });

IprConfigSelectController.$inject = [
  'IprTaxService', '$timeout', '$scope', 'NotifyService',
];

/**
 * Ipr Configuration Select Controller
 */
function IprConfigSelectController(IprConfigs, $timeout, $scope, Notify) {
  const $ctrl = this;

  // fired at the beginning of the ipr configuration select
  $ctrl.$onInit = function $onInit() {
    // translated label for the form input
    $ctrl.label = $ctrl.label || 'IPRTAX.CONFIG';

    // fired when an ipr configuration has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // default for form name
    $ctrl.name = $ctrl.name || 'IprConfigForm';


    if (!angular.isDefined($ctrl.required)) {
      $ctrl.required = true;
    }

    IprConfigs.read()
      .then(iprConfigs => {
        $ctrl.iprConfigLength = iprConfigs.length;
        $ctrl.iprConfigs = iprConfigs;
      })
      .catch(Notify.handleError);

    // alias the name as IprConfigForm
    $timeout(aliasComponentForm);
  };

  // this makes the HTML much more readable by reference IprConfigForm instead of the name
  function aliasComponentForm() {
    $scope.IprConfigForm = $scope[$ctrl.name];
  }

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function onSelect($item) {
    $ctrl.onSelectCallback({ iprConfig : $item });

    // alias the IprConfigForm name so that we can find it via filterFormElements
    $scope[$ctrl.name].$bhValue = $item.id;
  };
}
