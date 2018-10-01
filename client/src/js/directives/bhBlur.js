/**
 * This directive helps to give trigger an action() when the Enter or Tab key is pressed
 *
 * <input type="text" bh-blur="action()">
 */
angular.module('bhima.directives')
  .directive('bhBlur', () => {
    return (scope, elem, attrs) => {
      const ENTER_KEY = 13;
      const TAB_KEY = 9;

      const cb = (event) => {
        if (event.which === ENTER_KEY || event.which === TAB_KEY) {
          scope.$apply(() => {
            scope.$eval(attrs.bhBlur);
          });
          event.preventDefault();
        }
      };

      elem.on('keydown', cb);
      scope.$on('destroy', () => elem.off('keydown', cb));
    };
  });
