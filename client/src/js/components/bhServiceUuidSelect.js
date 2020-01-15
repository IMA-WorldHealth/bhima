angular.module('bhima.components')
  .component('bhServiceUuidSelect', {
    templateUrl : 'modules/templates/bhServiceUuidSelect.tmpl.html',
    controller  : ServiceUuidSelectController,
    transclude  : true,
    bindings    : {
      serviceUuid        : '<?',
      onSelectCallback : '&',
      label    : '@?',
      required : '<?',
    },
  });

ServiceUuidSelectController.$inject = [
  'ServiceService', 'NotifyService',
];

/**
 * Service Uuid Select Controller
 *
 */
function ServiceUuidSelectController(Services, Notify) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    $ctrl.label = $ctrl.label || 'FORM.LABELS.SERVICE';
    Services.read()
      .then((services) => {
        $ctrl.services = services;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = $item => {
    $ctrl.onSelectCallback({ service : $item });
  };
}
