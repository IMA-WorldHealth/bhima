angular.module('bhima.components')
  .component('bhServiceSelect', {
    templateUrl : 'modules/templates/bhServiceSelect.tmpl.html',
    controller  : serviceSelectController,
    transclude  : true,
    bindings    : {
      serviceId        : '<',
      disable          : '<?',
      onSelectCallback : '&',
      name             : '@?',
      required         : '<?',      
    },
  });

serviceSelectController.$inject = [
  'ServiceService', 'NotifyService',
];

/**
 * Service Select Controller
 *
 */
function serviceSelectController(Services, Notify) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {    
    // fired when a Service has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // default for form name
    $ctrl.name = $ctrl.name || 'FORM.LABELS.SERVICE';

    Services.read()
      .then(function (services) {
        $ctrl.services = services;
      })
      .catch(Notify.handleError);

    $ctrl.valid = true;

  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item, $model) {
    $ctrl.onSelectCallback({ service : $item });
  };
}