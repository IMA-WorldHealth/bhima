angular.module('bhima.controllers')
  .controller('InventoryGroupsActionsModalController', InventoryGroupsActionsModalController);

InventoryGroupsActionsModalController.$inject = [
  'InventoryGroupService', 'NotifyService', '$uibModalInstance', 'data',
];

function InventoryGroupsActionsModalController(InventoryGroups, Notify, Instance, Data) {
  var vm = this;

  // map for actions
  var map = { add : addGroup, edit : editGroup };

  // session
  vm.session = {};

  // expose to the view
  vm.submit = submit;
  vm.cancel = cancel;

  vm.onSelectCOGSAccount = onSelectCOGSAccount;
  vm.onSelectStockAccount = onSelectStockAccount;
  vm.onSelectSalesAccount = onSelectSalesAccount;

  // startup
  startup();

  /** submit data */
  function submit(form) {
    var record = cleanForSubmit(vm.session);

    if (form.$invalid) { return; }

    map[vm.action](record, vm.identifier)
      .then(handleInstanceClose);
  }

  function handleInstanceClose(res) {
    Instance.close(res);
  }

  /* add inventory group */
  function addGroup(record) {
    return InventoryGroups.create(record)
      .catch(Notify.handleError);
  }

  /* edit inventory group */
  function editGroup(record, uuid) {
    return InventoryGroups.update(uuid, record)
      .catch(Notify.handleError);
  }

  function onSelectCOGSAccount(account) {
    vm.session.cogs_account = account.id;
  }

  function onSelectStockAccount(account) {
    vm.session.stock_account = account.id;
  }

  function onSelectSalesAccount(account) {
    vm.session.sales_account = account.id;
  }

  /* cancel action */
  function cancel() {
    Instance.dismiss();
  }

  /** format data to data structure in the db */
  function cleanForSubmit(o) {
    return {
      name : o.name,
      code : o.code,
      sales_account : o.sales_account,
      stock_account : o.stock_account,
      cogs_account  : o.cogs_account,
    };
  }

  /** startup */
  function startup() {
    vm.action = Data.action;
    vm.identifier = Data.identifier;

    if (!vm.identifier) { return; }

    InventoryGroups.read(vm.identifier)
      .then(handleInventoryGroup)
      .catch(Notify.handleError);
  }

  function handleInventoryGroup(group) {
    vm.session = group;
  }
}
