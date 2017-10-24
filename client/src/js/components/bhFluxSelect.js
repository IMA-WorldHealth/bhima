angular.module('bhima.components')
  .component('bhFluxSelect', {
    templateUrl : 'modules/templates/bhFluxSelect.tmpl.html',
    controller  : FluxSelectController,
    bindings    : {
      onChange : '&',
      fluxIds : '<?',
      label : '@?',
      required : '<?',
      validationTrigger : '<?',
    },
  });

FluxSelectController.$inject = [
  'FluxService', 'NotifyService', '$translate',
];

/**
 * Flux Selection Component
 *
 */
function FluxSelectController(Flux, Notify, $translate) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {
    // label to display
    $ctrl.label = $ctrl.label || 'STOCK.FLUX';

    // fired when a Flux has been selected or removed from the list
    $ctrl.onChange = $ctrl.onChange || angular.noop;

    // init the model
    $ctrl.selectedFlux = $ctrl.fluxIds || [];

    // load all Flux
    Flux.read()
      .then(function (flux) {
        flux.forEach(function (item) {
          item.plainText = $translate.instant(item.label);
        });
        $ctrl.fluxes = flux;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component
  $ctrl.handleChange = function (models) {
    $ctrl.onChange({ flux : models });
  };
}
