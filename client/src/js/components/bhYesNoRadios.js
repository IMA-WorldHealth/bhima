angular.module('bhima.components')
  .component('bhYesNoRadios', {
    bindings : {
      defaultValue : '@?',
      value : '=',
      label : '@?',
      helpText : '@?',
      onChangeCallback : '&',
    },
    templateUrl : 'modules/templates/bhYesNoRadios.tmpl.html',
    controller : YesNoRadio,
  });

function YesNoRadio() {

  let $ctrl = this;
  $ctrl.$onInit = function onInit() {
    $ctrl.onChangeCallback = $ctrl.onChangeCallback;
    $ctrl.defaultValue = $ctrl.defaultValue;
    $ctrl.value = ($ctrl.defaultValue) ? 1 : 0;
    $ctrl.label = $ctrl.label;
    $ctrl.helpText = $ctrl.helpText;
  };

}