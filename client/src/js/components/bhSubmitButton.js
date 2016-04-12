angular.module('bhima.components')
.component('bhLoadingButton', {
  bindings : {
    loadingState : '<'
  },
  template :
    '<button type="submit" class="btn btn-primary" ng-disabled="$ctrl.loadingState" data-method="submit">' +
      '<span class="glyphicon glyphicon-refresh" ng-show="$ctrl.loadingState"></span> ' +
      '{{ ($ctrl.loadingState ? "FORM.BUTTONS.LOADING" : "FORM.BUTTONS.SUBMIT") | translate }} ' +
    '</button>'
});
