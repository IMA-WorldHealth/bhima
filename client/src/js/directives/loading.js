
angular.module('bhima.directives')
.directive('loadingIndicator', function () {
  return {
    restrict : 'E',
    template: '<span><i class="glyphicon glyphicon-refresh icon-spin"></i> {{ "UTIL.LOADING" | translate }} ...</span>',
  };
});


