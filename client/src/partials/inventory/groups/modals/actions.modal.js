angular.module('bhima.controllers')
.controller('InventoryGroupsActionsModalController', InventoryGroupsActionsModalController);

InventoryGroupsActionsModalController.$inject = [
  'AccountService', 'InventoryGroupService', 'NotifyService', '$uibModalInstance', 'data'
];

function InventoryGroupsActionsModalController(Account, InventoryGroup, Notify, Instance, Data) {
  var vm = this, session = vm.session = {};

  // map for actions
  var map = { 'add' : addGroup, 'edit' : editGroup };

  // expose to the view
  vm.submit = submit;
  vm.cancel = cancel;

  // startup
  startup();

  /** submit data */
  function submit() {
    var record = cleanForSubmit(vm.session);
    map[vm.action](record, vm.identifier)
    .then(function (res) {
      Instance.close(res);
    });
  }

  /** add inventory group */
  function addGroup(record) {
    return InventoryGroup.create(record)
    .then(function (res) {
      return res;
    })
    .catch(Notify.errorHandler);
  }

  /** edit inventory group */
  function editGroup(record, uuid) {
    return InventoryGroup.update(uuid, record)
    .then(function (res) {
      return res;
    })
    .catch(Notify.errorHandler);
  }

  /** cancel action */
  function cancel() {
    Instance.dismiss();
  }

  function cleanForSubmit(session) {
    return {
      name : session.name,
      code : session.code,
      sales_account : session.salesAccount.id,
      stock_account : session.stockAccount.id,
      cogs_account : session.cogsAccount.id
    };
  }

  /** startup */
  function startup() {
    vm.action = Data.action;
    vm.identifier = Data.identifier;

    Account.read()
    .then(function (list) {
      vm.accountList = list;
    })
    .catch(Notify.errorHandler);

    if (vm.identifier) {
      InventoryGroup.read(vm.identifier)
      .then(function (group) {
        vm.session = group[0];
      })
      .catch(Notify.errorHandler);
    }

  }

}
