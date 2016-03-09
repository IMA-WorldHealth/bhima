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

      // bind to the 'submit' event
      $element.bind('submit', function (e) {

        // return the form if the input is invalid.
        if (FormController.$invalid) { return; }

        FormController.$toggleLoading();

        $scope.submit()
        .finally(function () {
          FormController.$toggleLoading();
        });
      });
    }
  };
}
