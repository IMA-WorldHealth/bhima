angular.module('bhima.directives')
  .directive('bhHasPermission', bhHasPermission);

bhHasPermission.$inject = ['SessionService'];

/**
 * @function bhHasPermission
 *
 * @description
 * A sort directive to remove the underlying HTML if the Enterprise Setting is
 * not set.
 */
function bhHasPermission(Session) {
  return {
    restrict : 'A',
    scope : { bhHasPermission : '<' },
    link : (scope, element) => {
      const hasPermission = Session.hasUserAction(scope.bhHasPermission);
      // remove setting if not available
      if (!hasPermission) {
        element.remove();
      }
    },
  };
}
