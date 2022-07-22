angular.module('bhima.controllers')
  .controller('ContainerEditModalController', ContainerEditModalController);

// dependencies injections
ContainerEditModalController.$inject = [
  'data', 'ShipmentContainerService', 'NotifyService', '$uibModalInstance',
];

function ContainerEditModalController(Data, Containers, Notify, Instance) {

  const vm = this;

  const { NOT_CREATED } = Containers;

  vm.isCreate = Data.action === 'create';
  vm.existingContainer = Data.action === 'edit' && !(NOT_CREATED in Data.container);

  vm.loading = false;

  vm.container = {};

  vm.cancel = () => Instance.close(null);
  vm.submit = submit;

  function startup() {
    vm.loading = true;

    Containers.containerTypes()
      .then((ctypes) => {
        vm.containerTypes = ctypes;
        return true;
      })
      .then(() => {
        if (Data.container) {
          vm.container = Data.container;
          vm.loading = false;
        } else {
          vm.loading = false;
        }
      });
  }

  function submit(form) {
    if (form.$invalid) { return 0; }

    // NOTE: If the container did not already exist, do not create a new one.
    //       Let the parent controller (create_shipment) do that when
    //       appropriate.  Return the new/edited container.

    if (vm.existingContainer) {
      // The container already exists, so update it in the database immediately
      const updates = { // These are the only fields that we can update
        label : vm.container.label,
        container_type_id : vm.container.container_type_id,
      };
      Containers.update(vm.container.uuid, updates)
        .catch(Notify.handleError);
    }

    const ctype = vm.containerTypes.find(ct => ct.id === vm.container.container_type_id);
    vm.container.container_type = ctype.text;

    return Instance.close(vm.container);
  }

  startup();
}
