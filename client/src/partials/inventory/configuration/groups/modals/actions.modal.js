angular.module('bhima.controllers')
.controller('InventoryGroupsActionsModalController', InventoryGroupsActionsModalController);

InventoryGroupsActionsModalController.$inject = [
  'AccountService', 'InventoryGroupService', 'NotifyService', '$uibModalInstance', 'data', 'bhConstants'
];

function InventoryGroupsActionsModalController(Account, InventoryGroup, Notify, Instance, Data, bhConstants) {
  var vm = this, session = vm.session = {};

  // map for actions
  var map = { 'add' : addGroup, 'edit' : editGroup };

  // expose to the view
  vm.submit = submit;
  vm.cancel = cancel;
  vm.bhConstants = bhConstants;

  // startup
  startup();

  /** submit data */
  function submit(form) {
    if (form.$invalid) {
      return;
    }

    var record = cleanForSubmit(vm.session);
    map[vm.action](record, vm.identifier)
    .then(function (res) {
      Instance.close(res);
    });
  }

  /** add inventory group */
  function addGroup(record) {
    return InventoryGroup.create(record)
      .catch(Notify.handleError);
  }

  /** edit inventory group */
  function editGroup(record, uuid) {
    return InventoryGroup.update(uuid, record)
      .catch(Notify.handleError);
  }

  /** cancel action */
  function cancel() {
    Instance.dismiss();
  }

  /** format data to data structure in the db */
  function cleanForSubmit(session) {
    return {
      name : session.name,
      code : session.code,
      sales_account : session.salesAccount ? session.salesAccount.id : null,
      stock_account : session.stockAccount ? session.stockAccount.id : null,
      cogs_account  : session.cogsAccount ? session.cogsAccount.id : null
    };
  }

  /**
   * essential Account Detail
   * This function affect a correct object to the ui-select input text
   */
  function essentialAccountDetail(account) {
    return {
      id : account.id,
      number  : account.number,
      label   : account.label,
      locked  : account.locked,
      hrlabel : String(account.number).concat(' - ', account.label)
    };
  }

  /** startup */
  function startup() {
    vm.action = Data.action;
    vm.identifier = Data.identifier;

    Account.read()
      .then(function (accounts) {
        vm.accounts = accounts;
      })
      .catch(Notify.handleError);

    if (vm.identifier) {
      InventoryGroup.read(vm.identifier)
      .then(function (group) {
        vm.session = group[0];

        // if the account Id is undefined or null the Account Service returns an array or account
        // to fix it we assign a inexisting account Id 'undefinedIdentifier'
        var sales_account = group[0].sales_account || undefined;
        var stock_account = group[0].stock_account || undefined;
        var cogs_account  = group[0].cogs_account || undefined;

        // sales accounts
        if (sales_account) {
          Account.read(sales_account)
          .then(function (account) {
            vm.session.salesAccount = essentialAccountDetail(account);
          })
          .catch(Notify.handleError);
        }

        // stock accounts
        if (stock_account) {
          Account.read(stock_account)
          .then(function (account) {
            vm.session.stockAccount = essentialAccountDetail(account);
          })
          .catch(Notify.handleError);
        }

        // cogs accounts
        if (cogs_account) {
          Account.read(cogs_account)
          .then(function (account) {
            vm.session.cogsAccount = essentialAccountDetail(account);
          })
          .catch(Notify.handleError);
        }
      })
      .catch(Notify.handleError);
    }

  }

}
