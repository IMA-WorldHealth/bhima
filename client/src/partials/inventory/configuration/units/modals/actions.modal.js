angular.module('bhima.controllers')
  .controller('InventoryUnitActionsModalController', InventoryUnitActionsModalController);

InventoryUnitActionsModalController.$inject = [
  'InventoryUnitService', 'NotifyService', '$uibModalInstance', 'data'
];

function InventoryUnitActionsModalController(InventoryUnit, Notify, Instance, Data) {
  var vm = this, session = vm.session = {};

  // map for actions
  var map = { 'add' : addUnit, 'edit' : editUnit };

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

  /** add inventory unit */
  function addUnit(record) {
    return InventoryUnit.create(record)
      .catch(Notify.handleError);
  }

  /** edit inventory unit */
  function editUnit(record, uuid) {
    return InventoryUnit.update(uuid, record)
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
      InventoryUnit.read(vm.identifier)
      .then(function (unit) {
        vm.session = unit[0];
      })
      .catch(Notify.handleError);
    }

  }
}
