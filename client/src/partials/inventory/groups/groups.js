angular.module('bhima.controllers')
.controller('InventoryGroupsController', InventoryGroupsController);

// dependencies injection
InventoryGroupsController.$inject = [
  '$translate', 'InventoryGroupService', 'AccountService', 'NotifyService', 'ModalService'
];

/**
 * Inventory Group Controller ]
 * This controller is responsible for handling inventory group module
 */
function InventoryGroupsController($translate, InventoryGroup, Account, Notify, Modal) {
  var vm = this;

  /** paths in the headercrumb */
  vm.bcPaths = [
    { label : 'TREE.INVENTORY' },
    { label : 'TREE.INVENTORY_GROUP' }
  ];

  /** buttons in the headercrumb */
  vm.bcButtons = [{
    icon: 'fa fa-plus',
    label: $translate.instant('FORM.LABELS.ADD'),
    action: addInventoryGroup, color: 'btn-primary'
  }];

  // expose to the view
  vm.editInventoryGroup = editInventoryGroup;

  // startup
  startup();

  /** add inventory group */
  function addInventoryGroup() {
    var request = { action : 'add' };

    Modal.openInventoryGroupActions(request)
    .then(function (res) {
      if (res.uuid) {
        Notify.success('FORM.INFOS.CREATE_SUCCESS');
      }
    })
    .then(startup)
    .catch(Notify.errorHandler);
  }

  /** edit inventory group */
  function editInventoryGroup(uuid) {
    var request = { action : 'edit', identifier : uuid };

    Modal.openInventoryGroupActions(request)
    .then(function (res) {
      Notify.success('FORM.INFOS.UPDATE_SUCCESS');
    })
    .then(startup)
    .catch(Notify.errorHandler);
  }

  /** init the module */
  function startup() {

    // get accounts list
    Account.read()
    .then(handleAccountList)
    .then(InventoryGroup.read)
    .then(handleGroupList)
    .then(countInventory)
    .catch(Notify.errorHandler);

    // handle the list of accounts
    function handleAccountList(list) {
      vm.accountList = list;
    }

    // handle the list of group
    function handleGroupList(list) {
      vm.groupList = list;
      vm.groupList.forEach(function (group) {
        group.stockAccountNumber = getAccountNumber(group.stock_account);
        group.saleAccountNumber = getAccountNumber(group.sales_account);
        group.cogsAccountNumber = getAccountNumber(group.cogs_account);
      });
      return vm.groupList;
    }

    // handle number of inventory in group
    function countInventory(list) {
      list.forEach(function (item) {
        InventoryGroup.count(item.uuid)
        .then(function (number) {
          item.inventory_counted = number;
        })
        .catch(Notify.errorHandler);
      });
    }

  }

  /** get account from id */
  function getAccountNumber(id) {
    for(var i = 0; i < vm.accountList.length; i++) {
      var account = vm.accountList[i];
      if (account.id == id) {
        return account.number;
      }
    }
    return null;
  }

}
