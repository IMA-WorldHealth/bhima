angular.module('bhima.controllers')
.controller('DebtorGroupsController', DebtorGroupsController);

DebtorGroupsController.$inject = ['$http', '$translate', 'DebtorGroupService', 'SessionService', 'uuid'];

/**
 * Debtor Groups Controller
 * This controller is about the debtor groups management module in the admin zone
 * It's responsible for creating and updating a debtor group
 */
function DebtorGroupsController($http, $translate, DebtorGroup, Session, uuid) {
  'use strict';

  var vm = this;

  /** breadcrumb configurations */
  vm.bcPaths = [
    {
      label: $translate.instant('DEBTOR_GRP.TITLE'),
      current: true
    }
  ];
  vm.bcButtons = [
    {
      dataMethod : 'create',
      color  : 'btn-default',
      icon   : 'glyphicon glyphicon-plus-sign',
      label  : $translate.instant('DEBTOR_GRP.NEW'),
      action : create
    }
  ];

  /** init variables */
  vm.state = {};
  vm.debtorGroup = {};

  /** Expose to the view */
  vm.update = update;
  vm.cancel = cancel;
  vm.submit = submit;
  vm.selectAccount = selectAccount;
  vm.refreshValidation = refreshValidation;

  /** Load debtor groups */
  debtorGroupsList()
  .then(accountList)
  .then(priceList)
  .catch(handler);

  function debtorGroupsList() {
    return DebtorGroup.read()
    .then(function (list) {
      vm.debtorGroupList = list;
    });
  }

  /** @fixme Need service for getting accounts list */
  function accountList () {
    return $http.get('/accounts')
    .then(function (accounts) {
      vm.accounts = accounts;
    });
  }

  /** @fixme Need service for getting prices list */
  function priceList () {
    return $http.get('/prices')
    .then(function (prices) {
      vm.prices = prices;
    });
  }

  function update(uuid) {
    initialise('action', 'update', uuid);
  }

  function create() {
    initialise('action', 'create');
  }

  function cancel() {
    initialise('default');
  }

  function submit(invalid) {
    if (invalid) {
      vm.state.errored = true;
    }
    if (vm.debtorGroup.name && vm.action === 'create') {
      createDebtorGroup();
    }
    if (vm.debtorGroup.uuid && vm.debtorGroup.name && vm.action === 'update') {
      updateDebtorGroup(vm.debtorGroup.uuid);
    }
  }

  function createDebtorGroup() {
    vm.debtorGroup.enterprise_id = Session.enterprise.id;
    vm.debtorGroup.uuid = uuid();
    DebtorGroup.create(vm.debtorGroup)
    .then(function (res) {
      vm.state.created = true;
      vm.view = 'success';
    })
    .then(debtorGroupsList)
    .catch(error);
  }

  function updateDebtorGroup(uuid) {
    DebtorGroup.update(uuid, vm.debtorGroup)
    .then(function (res) {
      vm.state.updated = true;
      vm.view = 'success';
    })
    .then(debtorGroupsList)
    .catch(error);
  }

  function initialise(view, action, uuid) {
    vm.state.reset();
    vm.view   = view;
    vm.action = action;
    vm.debtorGroup  = {};

    vm.actionTitle =
      action === 'create' ? 'DEBTOR_GRP.NEW' :
      action === 'update' ? 'DEBTOR_GRP.EDIT' : '';

    if (uuid && action === 'update') {
      DebtorGroup.read(uuid)
      .then(function (debtorGroup) {
        vm.debtorGroup = debtorGroup;
      });
    }
  }

  function refreshValidation() {
    vm.state.errored = vm.debtorGroup.text ? false : true;
  }

  function selectAccount(account) {
    // vm.debtorGroup.account_id = account.id;
    // vm.accountLabel = account.account_number + ' - ' + account.account_txt;
  }

  function error(err) {
    vm.state.errored = true;
    handler(err);
  }

  function handler(err) {
    console.log(err);
  }

  vm.state.reset = function reset() {
    vm.state.errored = false;
    vm.state.updated = false;
    vm.state.created = false;
  };
}
