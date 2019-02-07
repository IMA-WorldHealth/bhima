angular.module('bhima.components')
  .component('bhInputText', {
    templateUrl : 'modules/templates/bhInputText.tmpl.html',
    controller : InputTextController,
    transclude : true,
    bindings : {
      textValue : '=',
      required : '@?',
      label : '@?',
      leftLabel : '<',
      placeholder : '@?',
      autocomplete : '@?',
      type : '@?',
      onChange : '<?',
      validationTrigger : '<',
      id : '@?',
    },
  });

/**
 * input fiel component
 *
 */
function InputTextController() {
  const $ctrl = this;

  // fired at the beginning
  $ctrl.$onInit = () => {
    $ctrl.type = $ctrl.type || 'text';
    $ctrl.id = $ctrl.id || 'inputText';
    $ctrl.placeholder = $ctrl.placeholder || '';
    $ctrl.noLabel = $ctrl.noLabel || false;
    $ctrl.onChange = $ctrl.onChange || angular.noop;
    $ctrl.autocomplete = $ctrl.autocomplete || 'on';
  };
}
