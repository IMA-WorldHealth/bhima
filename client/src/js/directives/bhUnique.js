angular.module('bhima.directives')
.directive('bhUnique', UniqueDirective);
  
UniqueDirective.$inject = ['UniqueValidatorService'];

/** 
 * Unique Input Directive 
 *
 * This input extends an input to add an asynchronous unique constraint. The 
 * directive will make HTTP requests to a specified URL and expect to recieve 
 * `true` and `false` values. This will then update the $valid property 
 * on the angluar form record. 
 *
 * @example 
 * <input id="email" type="email" bh-uniqe="/users/validateEmail">
 *
 * @module directives/bhUnique
 */
function UniqueDirective(UniqueValidator) { 
  return { 
    restrict : 'A', 
    require : 'ngModel',
    scope : { 
      bhUnique : '@bhUnique'
    },
    link : function uniqueLink(scope, element, attrs, ctrl) { 
      var validationUrl = scope.bhUnique;
      
      ctrl.$asyncValidators.unique = function (modelValue, viewValue) { 
        return UniqueValidator.check(validationUrl, viewValue);
      };
    }
  };
}
