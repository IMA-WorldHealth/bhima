angular.module('bhima.directives')
.directive('bhFormDefaults', bhFormDefaults);

/**
 * @class bhFormDefaults
 *
 * @description
 * The bhFormDefaults directive allows us to set custom attributes on any form
 * in the application and ensure they all behave the same.  It also creates a
 * single location for changing any of the attributes on the form in the future.
 */
function bhFormDefaults() {
  return {
    restrict: 'A',
    require: 'form',
    link: function bhFormDefaultsLinkFn($scope, $element, $attrs, $controller) {
      $attrs.$set('autocomplete', 'none');
      $attrs.$set('autocapitalize', 'none');
      $attrs.$set('autocorrect', 'none');
    }
  };
}
