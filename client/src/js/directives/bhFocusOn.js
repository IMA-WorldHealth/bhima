angular.module('bhima.directives')
  .directive('bhFocusOn', ['$timeout', function ($timeout) {
    return {
      restrict: 'A',
      link : function($scope, $element, $attr) {

        $scope.$watch($attr.bhFocusOn, function (shouldFocus) {
          $timeout(function () {
            return shouldFocus ? $element[0].focus() : $element[0].blur();
          }, 0, false);
        });

      }
    };
  }]);
