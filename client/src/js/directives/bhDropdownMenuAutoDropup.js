/*
  @bh-dropdown-menu-auto-dropup directive
  This directive check if html element's position is on the bottom if true it
  changes the element's position in order to display it conveniently.


  This directive is useful for carets for example
  Pages won't falls off page thanks to this directive if the user click on a dropdown

  Usage example
  .............

  <ul uib-dropdown-menu  bh-dropdown-menu-auto-dropup>
  </ul>

*/
angular.module('bhima.directives')
  .directive('bhDropdownMenuAutoDropup', ['$document', '$window', 'util', function ($document, $window, util) {
    return {
      restrict : 'AC',
      link : function (scope, iElement) {
        var iElementWrapper = iElement.parent();
        var documentHeight = angular.element($document).height();
        var offset = 35;

        // only recalculate the document height on window resize
        angular.element($window)
          .on('resize', util.debounce(handleWindowResize, 50));

        function handleWindowResize() {
          documentHeight = angular.element($document).height();
        }

        function handleClick() {
          var iElementWrapperOffsetTop = iElementWrapper.offset().top;
          var iElementHeight = iElement.height();

          var shouldDropUp = (documentHeight - iElementHeight - offset) < iElementWrapperOffsetTop;
          var position = shouldDropUp ?
            '-'.concat(iElementHeight + 35, 'px') :
            '0px';

          iElement.css({ 'margin-top' : position });
        }

        iElementWrapper.on('click', function () {
          scope.$apply(handleClick);
        });
      },
    };
  }]);
