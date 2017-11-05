/**
 * @overview bhHiddenField
 *
 * @description
 * This component allows a programmer to optionally hide a field in a form at
 * startup that may toggled open by the user if they need it.
 */

var template =
 '<p>' +
   '<a ng-click="$ctrl.toggleVisibility()" bh-hidden-field-toggle href>' +
      '<span ng-hide="$ctrl.visible"> + <span translate>{{ $ctrl.showText }}</span></span>' +
      '<span ng-show="$ctrl.visible"> - <span translate>{{ $ctrl.hideText }}</span></span>' +
   '</a>' +
 '</p>' +
 '<div ng-if="$ctrl.visible">' +
  '<ng-transclude></ng-transclude>' +
 '</div>';


angular.module('bhima.components')
  .component('bhHiddenField', {
    template : template,
    transclude : true,
    controller : bhHiddenFieldController,
    bindings : {
      showText : '@',
      hideText : '@',
    },
  });

function bhHiddenFieldController() {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {
    $ctrl.visible = false;
  };

  $ctrl.toggleVisibility = function toggleVisibility() {
    $ctrl.visible = !$ctrl.visible;
  };
}
