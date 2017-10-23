angular.module('bhima.components')
.component('bhGridLoadingIndicator', {
  bindings : {
    loadingState : '<',
    emptyState   : '<',
    errorState   : '<',
    messageState : '<?',
  },
  templateUrl : 'modules/templates/bhGridLoadingIndicator.tmpl.html',
});
