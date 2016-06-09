angular.module('bhima.components')
.component('bhLoadingButton', {
  bindings : {
    loadingState : '<',
    buttonClass : '@',
    disabled : '<'
  },
  transclude: true,
  template :
    '<button type="submit" class="btn" ng-class="$ctrl.buttonClass" ng-disabled="$ctrl.loadingState || $ctrl.disabled" data-method="submit">' +
      '<span ng-show="$ctrl.loadingState"><span class="glyphicon glyphicon-refresh"></span> {{ "FORM.INFOS.LOADING" | translate }}</span>' +
      '<span ng-hide="$ctrl.loadingState" ng-transclude>{{ "FORM.BUTTONS.SUBMIT" | translate }}</span>' +
    '</button>',
  controller : LoadingButtonController
});

/** @todo This behaviour should be implmented using default transclude when it is available in the project supported Angular */
function LoadingButtonController() { 
  var component = this;
 
  // set default values for button class
  component.buttonClass = component.buttonClass || 'btn-primary';
}
