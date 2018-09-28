/**
 * This directive helps to give trigger an action() when the Enter or Tab key is pressed
 *
 * <input type="text" bh-blur="action()">
 */
angular.module('bhima.directives')
  .directive('bhBlur', () => {
    return (scope, elem, attrs) => {
      elem.bind('keydown', (event) => {
        // 13 represents enter button and 9 represents tab button
        if (event.which === 13 || event.which === 9) {
          scope.$apply(() => {
            scope.$eval(attrs.bhBlur);
          });
          event.preventDefault();
        }
      });
    };
  });
