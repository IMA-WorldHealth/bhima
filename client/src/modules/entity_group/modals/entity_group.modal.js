angular.module('bhima.controllers')
  .controller('EntityGroupModalController', EntityGroupModalController);

EntityGroupModalController.$inject = [
  '$state', 'EntityGroupService', 'NotifyService',
];

function EntityGroupModalController($state, EntityGroup, Notify) {
  const vm = this;
  const entityGroupUuid = $state.params.uuid || {};

  vm.group = {};
  vm.isCreating = !!($state.params.creating);

  // exposed methods
  vm.submit = submit;

  vm.onSelectEntities = entities => {
    vm.group.entities = entities;
  };

  vm.clear = (key) => {
    delete vm[key];
  };

  function init() {
    if (vm.isCreating) { return; }

    EntityGroup.read(entityGroupUuid)
      .then(group => {
        vm.group = group;
      })
      .catch(Notify.handleError);
  }

  // submit the data to the server from all two forms (update, create)
  function submit(entityForm) {
    if (entityForm.$invalid) {
      return 0;
    }

    if (entityForm.$pristine) {
      cancel();
      return 0;
    }

    const params = vm.group;
    const promise = (vm.isCreating)
      ? EntityGroup.create(params)
      : EntityGroup.update(entityGroupUuid, params);

    return promise
      .then(() => {
        const translateKey = (vm.isCreating) ? 'ENTITY.CREATED' : 'ENTITY.UPDATED';
        Notify.success(translateKey);
        $state.go('entityGroup', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function cancel() {
    $state.go('entityGroup');
  }

  init();
}
