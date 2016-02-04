angular.module('bhima.directives')
.directive('financeFooter', FinanceFooterDirective);

function FinanceFooterDirective() { 
  return  { 
    restrict : 'A',
    transclude : true,
    template : '<ng-transclude />',
    link : function (scope, element, attrs) { 

      // Attach utility method to scope
      scope.calculate = calculate;
      
      function calculate(renderedColumns) { 
        var leadingColumns = 5;
      
        return renderedColumns.reduce(function (width, column, index) { 
          // console.log('reduce', width, column, index);
           
          if (index < leadingColumns) { 
            width += column.drawnWidth;
          }

          return width;
        }, 0);
      }
    }
  };
}
