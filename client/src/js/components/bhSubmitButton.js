angular.module('bhima.components')
.component('bhLoadingButton', {
  bindings : {
    loadingState : '<'
  },
  template :
    '<button type="submit" class="btn btn-primary" ng-disabled="$ctrl.loadingState" data-method="submit">' +
      '<span class="glyphicon glyphicon-refresh" ng-show="$ctrl.loadingState"></span> ' +
      '{{ ($ctrl.loadingState ? "UTIL.LOADING" : "FORM.SUBMIT") | translate }} ' +
    '</button>'
});
