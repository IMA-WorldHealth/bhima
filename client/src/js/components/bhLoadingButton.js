angular.module('bhima.components')
.component('bhLoadingButton', {
  bindings : {
    loadingState : '<',
    disabled : '<'
  },
  transclude: true,
  template :
    '<button type="submit" class="btn btn-primary" ng-disabled="$ctrl.loadingState || $ctrl.disabled" data-method="submit">' +
      '<span ng-show="$ctrl.loadingState"><span class="glyphicon glyphicon-refresh"></span> {{ "FORM.INFOS.LOADING" | translate }}</span>' +
      '<span ng-hide="$ctrl.loadingState" ng-transclude>{{ "FORM.BUTTONS.SUBMIT" | translate }}</span>' +
    '</button>'
});
