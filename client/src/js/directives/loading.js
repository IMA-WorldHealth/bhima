angular.module('bhima.directives')
.directive('loadingIndicator', function () {
  return {
    restrict : 'E',
    template: '<h3><p class="text-info"><span class="fa fa-circle-o-notch fa-spin"></span> <span translate>FORM.INFO.LOADING</span>...</p></h3>',
  };
});
