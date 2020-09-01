angular.module('bhima.components')
  .component('bhLocationTypeMultipleSelect', {
    templateUrl : 'modules/templates/bhLocationTypeMultipleSelect.tmpl.html',
    controller  : LocationTypeMultipleSelectController,
    bindings    : {
      onChange : '&',
      typeIds : '<?',
      label : '@?',
      required : '<?',
    },
  });

LocationTypeMultipleSelectController.$inject = [
  'LocationService', 'NotifyService', '$translate',
];

/**
 * Location Type Multiple Select Controller
 *
 */
function LocationTypeMultipleSelectController(locationService, Notify, $translate) {
  const $ctrl = this;

  $ctrl.$onInit = () => {
    // label to display
    $ctrl.label = $ctrl.label || 'FORM.LABELS.TYPE';

    // init the model
    $ctrl.typeIds = $ctrl.typeIds || [];

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

  $ctrl.handleChange = (types) => $ctrl.onChange({ types });
}
