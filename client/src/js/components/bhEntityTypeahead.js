angular.module('bhima.components')
  .component('bhEntityTypeahead', {
    templateUrl : 'modules/templates/bhEntityTypeahead.html',
    controller  : bhEntityTypeaheadController,
    bindings    : {
      entityUuid : '<?',
      onSelectCallback : '&',
      disabled : '<?',
    },
  });

bhEntityTypeaheadController.$inject = [
  'FindEntityService', 'NotifyService',
];

function bhEntityTypeaheadController(FindEntities, Notify) {
  const $ctrl = this;

  $ctrl.$onInit = () => {
    if ($ctrl.entityUuid) {
      fetchEntityByUuid($ctrl.entityUuid);
    }
  };

  function fetchEntityByUuid(uuid) {
    FindEntities.read(uuid)
      .then(entity => { $ctrl.entity = entity; })
      .catch(Notify.handleError);
  }

  $ctrl.$onChanges = changes => {
    const entityUuid = changes.entityUuid && changes.entityUuid.currentValue;
    if (entityUuid) {
      fetchEntityByUuid(entityUuid);
    }
  };

  $ctrl.lookupEntities = (text) => {
    if (text.length < 3) { return null; }
    return FindEntities.read(null, { text, limit : 10 });
  };

  $ctrl.onSelectEntity = entity => {
    $ctrl.onSelectCallback({ entity });
  };
}
