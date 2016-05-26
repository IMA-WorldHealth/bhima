angular.module('bhima.components')
.component('bhGridLoadingIndicator', {
  bindings: {
    loadingState: '<',
    emptyState: '<',
    errorState: '<'
  },
  templateUrl  : 'partials/templates/bhGridLoadingIndicator.tmpl.html',
});
