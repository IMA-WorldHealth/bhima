angular.module('bhima.directives')
.directive('bhUnique', UniqueDirective);

UniqueDirective.$inject = ['$q', 'UniqueValidatorService'];

/**
 * Unique Input Directive
 *
 * This input extends an input to add an asynchronous unique constraint. The
 * directive will make HTTP requests to a specified URL and expect to recieve
 * `true` and `false` values. This will then update the $valid property
 * on the angluar form record.
 *
 * The UniqueValidator service is used and therefore the URL provided will be
 * required to implement the `exists` API. See the `services/UniqueValidatorService`
 * documentation for more details and examples.
 *
 * @example
 *
 * <!-- will result in a HTTP GET request to /users/attribute/:value/exists -->
 * <input id="email" type="email" bh-unique="/users/attribute">
 *
 * @module directives/bhUnique
 */
function UniqueDirective($q, UniqueValidator) {
  return {
    restrict : 'A',
    require : 'ngModel',
    scope : {
      bhUnique : '@bhUnique'
    },
    link : function uniqueLink(scope, element, attrs, ctrl) {
      var validationUrl = attrs.bhUnique;

      // the $error that will be passed on to ng-messages if this directive fails
      // to validate the input
      var exceptionKey = 'exception';

      ctrl.$asyncValidators.unique = function (modelValue, viewValue) {

        // deferred object must be used to handle catch statement within
        // this scope - $q does not currently support chaining catch statements
        var deferred = $q.defer();

        // don't make an HTTP request unless there is content to validate
        if (ctrl.$isEmpty(modelValue)) {
          return $q.when();
        }

        UniqueValidator.check(validationUrl, viewValue)
          .then(function (valueExists) {

            // as we have recieved a valid HTTP response there is nothing wrong
            // with the connection to the server
            ctrl.$setValidity(exceptionKey, true);

            if (valueExists) {
              deferred.reject();
            } else {
              deferred.resolve();
            }
          })
          .catch(function (error) {

            // expose that there has been an issue beyond the directives control
            // to the view
            ctrl.$setValidity(exceptionKey, false);
            deferred.reject();
          });

        return deferred.promise;
      };
    }
  };
}
