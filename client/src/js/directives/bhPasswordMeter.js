angular.module('bhima.directives')
.directive('bhPasswordMeter', PasswordValidatorDirective);

PasswordValidatorDirective.$inject = ['PasswordMeterService'];

/**
 * Passord Validator Directive
 *
 * This directive provides a generic password validatation.
 * the validation condition is defined at  PasswordMeterService
 *
 * @example
 * <input name="pwd" type="passord" bh-password-meter>
 *
 * <div ng-messages="form.pwd.$error">
 *   <p ng-messages-include="modules/templates/messages.tmpl.html"></p>
 * </div>
 *
 * @module directives/PasswordValidatorDirective
 */
function PasswordValidatorDirective(PasswordMeterService) {
  return {
    restrict : 'A',
    require : 'ngModel',

    link : function passwordLink(scope, element, attrs, ctrl) {

      ctrl.$validators.password = function (modelValue, viewValue) {
        return PasswordMeterService.validate(viewValue);
      };
    }
  };
}
