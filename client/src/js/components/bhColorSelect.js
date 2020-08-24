angular.module('bhima.components')
  .component('bhColorSelect', {
    templateUrl : 'modules/templates/bhColorSelect.tmpl.html',
    controller  : ColorSelectController,
    transclude  : true,
    bindings    : {
      value  : '<',
      onSelectCallback : '&',
      required : '@?',
      label : '@?',
    },
  });

ColorSelectController.$inject = [
  'ColorService',
];

/**
 * Color Select Controller
 *
 */
function ColorSelectController(Color) {
  const $ctrl = this;
  $ctrl.label = $ctrl.label || 'FORM.LABELS.COLOR';
  $ctrl.$onInit = function onInit() {
    $ctrl.required = $ctrl.required || false;
    $ctrl.colors = Color.list;
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = ($item) => {
    $ctrl.onSelectCallback({ color : $item });
  };
}
