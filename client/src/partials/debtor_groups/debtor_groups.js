angular.module('bhima.controllers')
.controller('DebtorGroupsController', DebtorGroupsController);

DebtorGroupsController.$inject = ['$http', '$translate', 'DebtorGroupService', 'SessionService', 'uuid', 'util'];

/**
 * Debtor Groups Controller
 * This controller is about the debtor groups management module in the admin zone
 * It's responsible for creating and updating a debtor group
 * @todo Implementing the delete method for deleting debtor groups
 */
function DebtorGroupsController($http, $translate, DebtorGroup, Session, uuid, util) {
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
      label  : $translate.instant('DEBTOR_GRP.NEW_DEBTOR_GRP'),
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
  vm.refreshValidation = refreshValidation;
  vm.length100 = util.length100;
  vm.length20 = util.length20;
  vm.length100 = util.length100;  

  /** Load necessary data */
  debtorGroupsList();
  accountList();
  priceList();

  function debtorGroupsList() {
    return DebtorGroup.read()
    .then(function (list) {
      vm.debtorGroupList = list;
    })
    .catch(handler);
  }

  /** @fixme Need service for getting accounts list */
  function accountList () {
    return $http.get('/accounts')
    .then(function (accounts) {
      vm.accounts = accounts;
    })
    .catch(handler);
  }

  /** @fixme Need service for getting prices list */
  function priceList () {
    return $http.get('/prices')
    .then(function (prices) {
      vm.prices = prices;
    })
    .catch(handler);
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
      return;
    }

    // figure out what type of request to send
    var isUpdate = (vm.action === 'update');

    // execute the chosen request.
    if (isUpdate) {
      updateDebtorGroup(vm.debtorGroup.uuid);
    } else {
      createDebtorGroup();
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
      })
      .catch(handler);
    }
  }

  function refreshValidation() {
    vm.state.errored = vm.debtorGroup.name ? false : true;
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
