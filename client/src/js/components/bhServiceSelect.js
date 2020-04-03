angular.module('bhima.components')
  .component('bhServiceSelect', {
    templateUrl : 'modules/templates/bhServiceSelect.tmpl.html',
    controller  : ServiceSelectController,
    transclude  : true,
    bindings    : {
      serviceId        : '<?',
      serviceUuid : '<?',
      onSelectCallback : '&',
      label    : '@?',
      required : '<?',
    },
  });

ServiceSelectController.$inject = [
  'ServiceService', 'NotifyService',
];

/**
 * Service Select Controller
 */
function ServiceSelectController(Services, Notify) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    $ctrl.label = $ctrl.label || 'FORM.LABELS.SERVICE';

    Services.read()
      .then((services) => {
        $ctrl.services = services;

        if ($ctrl.serviceUuid) {
          selectServiceByUuid($ctrl.serviceUuid);
        }
      })
      .catch(Notify.handleError);
  };

  $ctrl.$onChanges = (changes) => {
    if (changes && changes.serviceUuid && $ctrl.services) {
      selectServiceByUuid(changes.serviceUuid);
    }
  };

  function selectServiceByUuid(uuid) {
    $ctrl.services.forEach(service => {
      if (service.uuid === uuid) {
        $ctrl.serviceId = service.id;
      }
    });
  }

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = $item => {
    $ctrl.onSelectCallback({ service : $item });
  };
}
