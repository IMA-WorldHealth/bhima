angular.module('bhima.controllers')
.controller('InventoryTypeActionsModalController', InventoryTypeActionsModalController);

InventoryTypeActionsModalController.$inject = [
  'InventoryTypeService', 'NotifyService', '$uibModalInstance', 'data'
];

function InventoryTypeActionsModalController(InventoryType, Notify, Instance, Data) {
  var vm = this, session = vm.session = {};

  // map for actions
  var map = { 'add' : addType, 'edit' : editType };

  // expose to the view
  vm.submit = submit;
  vm.cancel = cancel;

  // startup
  startup();

  /** submit data */
  function submit(form) {
    if (form.$invalid) { return; }

    var record = cleanForSubmit(vm.session);
    map[vm.action](record, vm.identifier)
      .then(function (res) {
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
  function cleanForSubmit(session) {
    return {
      text : session.text
    };
  }

  /** startup */
  function startup() {
    vm.action = Data.action;
    vm.identifier = Data.identifier;

    if (vm.identifier) {
      InventoryType.read(vm.identifier)
      .then(function (type) {
        vm.session = type[0];
      })
      .catch(Notify.handleError);
    }

  }

}
