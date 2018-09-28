/**
 * This directive helps to give focus to an element when an expression is true
 *
 * <input type="text" bh-focus="true">
 */
angular.module('bhima.directives')
  .directive('bhFocus', ['$timeout', '$parse', ($timeout, $parse) => {
    return {
      link : (scope, element, attrs) => {
        const model = $parse(attrs.bhFocus);
        scope.$watch(model, (value) => {
          if (value === true) {
            $timeout(() => element[0].focus());
          }
        });
      },
    };
  }]);
