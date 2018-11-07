angular.module('bhima.components')
  .component('bhEntitySelect', {
    templateUrl : 'js/components/bhEntitySelect/bhEntitySelect.tmpl.html',
    controller  : EntitySelectController,
    transclude  : true,
    bindings    : {
      entityUuid       : '<',
      onSelectCallback : '&',
      required         : '<?',
      label            : '@',
    },
  });

EntitySelectController.$inject = ['EntityService', 'NotifyService'];

/**
 * Entity selection component
 */
function EntitySelectController(Entities, Notify) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    $ctrl.loading = true;
    $ctrl.label = $ctrl.label || 'ENTITY.LABEL';

    // load all depots
    Entities.read(null)
      .then((entities) => {
        $ctrl.entities = entities;
      })
      .catch(Notify.handleError)
      .finally(() => {
        $ctrl.loading = false;
      });
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = $item => {
    $ctrl.onSelectCallback({ entity : $item });
  };
}
