angular.module('bhima.components')
  .component('bhYesNoRadios', {
    bindings : {
      value : '<',
      label : '@',
      name : '@',
      helpText : '@?',
      onChangeCallback : '&',
      required : '<?',
    },
    transclude  : true,
    templateUrl : 'modules/templates/bhYesNoRadios.tmpl.html',
    controller : YesNoRadioController,
  });

/**
 * @function YesNoRadioController
 *
 * @description
 * This component makes yes/no options a bit easier to navigate.
 */
function YesNoRadioController() {
  const $ctrl = this;

  $ctrl.$onInit = () => {
    $ctrl.required = typeof ($ctrl.required) === 'undefined' ? true : $ctrl.required;

    if ($ctrl.required) {
      $ctrl.value = $ctrl.value ? Number.parseInt($ctrl.value, 10) : 0;
    } else {
      $ctrl.value = $ctrl.value ? Number.parseInt($ctrl.value, 10) : undefined;
    }
  };

  $ctrl.onChange = (value) => {
    $ctrl.onChangeCallback({ value });
  };
}
