/* 
  @ bh-dropdown-menu-auto-dropup directive
  this directive check if html element's position is on the bottom
  if true it changes the element's position in order to display it conviniently

  it directive is usefull for carets for exemple
  Pages won't falls off page thanks to this directive if the user click on a dropdown 

  Usage example
  .............

  <ul uib-dropdown-menu  bh-dropdown-menu-auto-dropup>
  </ul>

*/
angular.module('bhima.directives')
.directive('bhDropdownMenuAutoDropup', ['$document',
  function($document) {
    return {
      restrict: 'AC',
      link: function(scope, iElement, iAttrs) {

        var iElementWrapper = iElement.parent();

        iElementWrapper.on('click', function() {

          var iElementWrapperOffsetTop = iElementWrapper.offset().top;
          var iElementHeight = iElement.height();
          var documentHeight = angular.element($document).height();
                  
          if((documentHeight - iElementHeight) < iElementWrapperOffsetTop) {
            iElement.css({'margin-top': '0px'});
            iElement.animate({'margin-top': '-' + (iElementHeight + 35) + 'px'}, 50);
          }    
          else { // can dis play without changing the element's position
                  //just animate
            iElement.css({'margin-top' : '50px'});
            iElement.animate({'margin-top' : '0px'}, 50);
          }
          
        });
      }
    }
  }
]);