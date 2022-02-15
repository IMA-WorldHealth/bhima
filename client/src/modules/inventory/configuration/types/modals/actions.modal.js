angular.module('bhima.controllers')
  .controller('InventoryTypeActionsModalController', InventoryTypeActionsModalController);

InventoryTypeActionsModalController.$inject = [
  'InventoryTypeService', 'NotifyService', '$uibModalInstance', 'data',
];

function InventoryTypeActionsModalController(InventoryType, Notify, Instance, Data) {
  const vm = this;
  vm.session = {};

  // map for actions
  const map = {
    add  : addType,
    edit : editType,
  };

  // expose to the view
  vm.submit = submit;
  vm.cancel = cancel;

  // startup
  startup();

  /** submit data */
  function submit(form) {
    if (form.$invalid) { return; }

    const record = cleanForSubmit(vm.session);

    map[vm.action](record, vm.identifier)
      .then((res) => {
        Instance.close(res);
      });
  }

  /** add inventory type */
  function addType(record) {
    return InventoryType.create(record)
      .catch(Notify.handleError);
  }

  /** edit inventory type */
  function editType(record, uuid) {
    return InventoryType.update(uuid, record)
      .catch(Notify.handleError);
  }

  /** cancel action */
  function cancel() {
    Instance.dismiss();
  }

  /** format data to data structure in the db */
  function cleanForSubmit(data) {
    return {
      text : data.text,
      description : data.description,
    };
  }

  /** startup */
  function startup() {
    vm.action = Data.action;
    vm.identifier = Data.identifier;

    if (vm.identifier) {
      InventoryType.read(vm.identifier)
        .then((type) => {
          [vm.session] = type;
        })
        .catch(Notify.handleError);
    }
  }
}
