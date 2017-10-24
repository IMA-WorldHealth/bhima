angular.module('bhima.components')
  .component('bhServiceSelect', {
    templateUrl : 'modules/templates/bhServiceSelect.tmpl.html',
    controller  : ServiceSelectController,
    transclude  : true,
    bindings    : {
      serviceId        : '<',
      onSelectCallback : '&',      
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
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {    

    Services.read()
      .then(function (services) {
        $ctrl.services = services;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item) {
    $ctrl.onSelectCallback({ service : $item });
  };
}