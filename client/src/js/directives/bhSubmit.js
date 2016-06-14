angular.module('bhima.directives')
.directive('bhSubmit', bhSubmitDirective);

function bhSubmitDirective() {
  return {
    restrict : 'A',
    require : 'form', // make sure we are on an ngForm element
    priority : 1,     // This must be a number greater than zero
    scope : {
      submit: '&bhSubmit'
    },
    link : function bhSubmitLinkFn($scope, $element, $attrs, $controller) {

      // pick up the form controller
      var FormController = $controller;

      // bind the initial loading state to false
      FormController.$loading = false;

      // bind the $toggleLoading method to switch the form's loading state
      FormController.$toggleLoading = function $toggleLoading() {
        FormController.$loading = !FormController.$loading;
      };

      // check to see if an object is a promise
      function isPromise(object) {
        return object && angular.isFunction(object.finally);
      }

      // bind to the 'submit' event
      $element.bind('submit', function (e) {

        // start the loading state
        FormController.$toggleLoading();

        // make sure the form is registered as submitted
        FormController.$setSubmitted();

        // fire the submit method
        var response = $scope.submit();

        // the response is a promise, toggle the loading state on
        // fulfillment/rejection
        if (isPromise(response)) {
          response.finally(function () {
            FormController.$toggleLoading();
          });

        // otherwise, toggle the loading state off right away.
        } else {
          FormController.$toggleLoading();
        }
      });
    }
  };
}
