angular.module('bhima.components')
.component('bhGridLoadingIndicator', {
  bindings : {
    loadingState : '<',
    emptyState   : '<',
    errorState   : '<',
  },
  templateUrl : 'modules/templates/bhGridLoadingIndicator.tmpl.html',
});
