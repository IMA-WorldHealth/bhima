angular.module('bhima.components')
  .component('bhLocationTypeSelect', {
    templateUrl : 'modules/templates/bhLocationTypeSelect.tmpl.html',
    controller  : LocationTypeSelectController,
    transclude  : true,
    bindings    : {
      locationTypeId   : '<',
      onSelectCallback : '&',
      required : '@?',
      label : '@?',
    },
  });

LocationTypeSelectController.$inject = [
  'LocationService', 'NotifyService', '$translate',
];

/**
 * Location Type Select Controller
 *
 */
function LocationTypeSelectController(locationService, Notify, $translate) {
  const $ctrl = this;
  $ctrl.label = $ctrl.label || 'FORM.LABELS.TYPE';
  $ctrl.$onInit = function onInit() {
    $ctrl.required = $ctrl.required || false;
    locationService.types()
      .then((types) => {
        types.forEach(type => {
          type.typeLabel = $translate.instant(type.translation_key);
        });

        types.sort((a, b) => {
          return a.typeLabel - b.typeLabel;
        });

        $ctrl.types = types;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item) {
    $ctrl.onSelectCallback({ type : $item });
  };
}
