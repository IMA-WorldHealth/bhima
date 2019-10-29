angular.module('bhima.components')
  .component('bhServiceSelect', {
    templateUrl : 'modules/templates/bhServiceSelect.tmpl.html',
    controller  : ServiceSelectController,
    transclude  : true,
    bindings    : {
      serviceId        : '<?',
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
 *
 */
function ServiceSelectController(Services, Notify) {
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
