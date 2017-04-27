angular.module('bhima.controllers')
.controller('InventoryGroupsController', InventoryGroupsController);

// dependencies injection
InventoryGroupsController.$inject = [
  '$translate', 'InventoryGroupService', 'AccountService',
  'NotifyService', 'ModalService', 'Store'
];

/**
 * Inventory Group Controller ]
 * This controller is responsible for handling inventory group module
 */
function InventoryGroupsController($translate, InventoryGroup, Account, Notify, Modal, Store) {
  var vm = this, AccountStore;

  /** global variables */
  vm.created = false;
  vm.updated = false;

  /** paths in the headercrumb */
  vm.bcPaths = [
    { label : 'TREE.INVENTORY' },
    { label : 'TREE.INVENTORY_GROUP' }
  ];

  // expose to the view
  vm.editInventoryGroup = editInventoryGroup;
  vm.addInventoryGroup = addInventoryGroup;
  vm.deleteInventoryGroup = deleteInventoryGroup;

  // startup
  startup();

  /** add inventory group */
  function addInventoryGroup() {
    var request = { action : 'add' };

    Modal.openInventoryGroupActions(request)
    .then(function (res) {
      if (res.uuid) {
        Notify.success('FORM.INFO.CREATE_SUCCESS');
      }
    })
    .then(startup)
    .catch(Notify.handleError);
  }

  /** edit inventory group */
  function editInventoryGroup(uuid) {
    var request = { action : 'edit', identifier : uuid };

    Modal.openInventoryGroupActions(request)
    .then(function (res) {
      Notify.success('FORM.INFO.UPDATE_SUCCESS');
    })
    .then(startup)
    .catch(Notify.handleError);
  }

  /** delete inventory group */
  function deleteInventoryGroup(id) {
    Modal.confirm('FORM.DIALOGS.CONFIRM_DELETE')
    .then(function (bool) {
       // if the user clicked cancel, reset the view and return
       if (!bool) {
          vm.view = 'default';
          return;
       }
      // if we get there, the user wants to delete
      InventoryGroup.remove(id)
        .then(function () {
          Notify.success('FORM.INFO.DELETE_SUCCESS');
          startup();
          return;
        })
        .catch(Notify.handleError);
    });
  }


  /** init the module */
  function startup() {

    // initializes inventory group list with associate accounts
    Account.read()
    .then(handleAccountList)
    .then(readInventoryGroup)
    .then(handleGroupList)
    .catch(Notify.handleError);

    // handle the list of accounts
    function handleAccountList(list) {
      vm.accountList = list;
      AccountStore = new Store({ id : 'id', data : list });
    }

    // handle the list of group
    function handleGroupList(list) {
      list.forEach(function (group) {
        // stock account
        group.stockAccountNumber = AccountStore.get(group.stock_account) ?
          AccountStore.get(group.stock_account).number : '';

        // sales account
        group.saleAccountNumber  = AccountStore.get(group.sales_account) ?
          AccountStore.get(group.sales_account).number : '';

        // charge account
        group.cogsAccountNumber  = AccountStore.get(group.cogs_account) ?
          AccountStore.get(group.cogs_account).number : '';
      });

      vm.groupList = list;

      return list;
    }

    function readInventoryGroup(){
      return InventoryGroup.read(null, { include_members : 1 });
    }

  }

}
