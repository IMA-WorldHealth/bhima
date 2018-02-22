angular.module('bhima.components')
  .component('bhFilterToggle', {
    templateUrl: '/modules/templates/bhFilterToggle.tmpl.html',
    controller: ToggleFillterController,
    bindings : {
      onToggle: '&', // use a callback to handle on click function
    },
  });


/**
 * bhToggleFillter Component
 * @module components/bhToggleFillter
 * 
 * usage :
 * <bh-filter-toggle on-toggle="AccountsCtrl.toggleInlineFilter()"></bh-filter-toggle>
 */
function ToggleFillterController() {

  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    $ctrl.filterEnabled = false;

    $ctrl.onToggle = $ctrl.onToggle;

    $ctrl.toggle = function () {
      $ctrl.filterEnabled = !$ctrl.filterEnabled;
      $ctrl.onToggle();
    }
  };

}
