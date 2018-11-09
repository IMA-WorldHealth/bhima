angular.module('bhima.controllers')
  .controller('EntityModalController', EntityModalController);

EntityModalController.$inject = [
  '$state', 'EntityService', 'NotifyService',
];

function EntityModalController($state, Entities, Notify) {
  const vm = this;

  vm.entity = $state.params.entity || {};
  vm.isCreating = !!($state.params.creating);

  // exposed methods
  vm.submit = submit;

  vm.onSelectEntityType = type => {
    vm.entity.entity_type_id = type.id;
  };

  vm.onSelectGender = gender => {
    vm.entity.gender = gender;
  };

  vm.clear = (key) => {
    delete vm[key];
  };

  // submit the data to the server from all two forms (update, create)
  function submit(entityForm) {
    if (entityForm.$invalid) {
      return 0;
    }

    if (entityForm.$pristine) {
      cancel();
      return 0;
    }

    const params = Entities.clean(vm.entity);

    const promise = (vm.isCreating)
      ? Entities.create(params)
      : Entities.update(params.uuid, params);

    return promise
      .then(() => {
        const translateKey = (vm.isCreating) ? 'ENTITY.CREATED' : 'ENTITY.UPDATED';
        Notify.success(translateKey);
        $state.go('entities', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function cancel() {
    $state.go('entities');
  }
}
