angular.module('bhima.controllers')
.controller('DepotManagementController', DepotManagementController);

DepotManagementController.$inject = ['$translate', 'DepotService', 'SessionService', 'util'];

/**
 * Depot Management Controller
 *
 * This controller is about the depot management module in the admin zone
 * It's responsible for creating, editing and updating a depot
 */
function DepotManagementController($translate, DepotService, SessionService, util) {
  'use strict';

  var vm = this;

  /** breadcrumb configurations */
  vm.bcPaths = [{
    label: $translate.instant('DEPOT.MAIN.TITLE'),
    current: true
  }];

  vm.bcButtons = [{
    dataMethod : 'create',
    color  : 'btn-default',
    icon   : 'glyphicon glyphicon-plus-sign',
    label  : $translate.instant('DEPOT.ADD_DEPOT'),
    action : create
  }];

  /* variables */
  var map = {
    create : {
      title : 'DEPOT.ADD_DEPOT',
      submit : createDepot
    },
    update : {
      title : 'DEPOT.EDIT_DEPOT',
      submit : updateDepot
    },
    remove : {
      title : 'FORM.DIALOGS.CONFIRM_DELETE',
      submit : removeDepot
    }
  };

  /** init variables */
  vm.state = {};
  vm.depot = {};

  /** Expose to the view */
  vm.update = update;
  vm.cancel = cancel;
  vm.submit = submit;
  vm.remove = remove;
  vm.refreshValidation = refreshValidation;
  vm.maxLength = util.maxTextLength;

  /** Load depots */
  depotsList();

  function depotsList() {
    DepotService.read()
    .then(function (list) {
      vm.depotList = list;
    });
  }

  function update(uuid) {
    initialise('action', 'update', uuid);
  }

  function create() {
    initialise('action', 'create');
  }

  function remove(id) {
    initialise('action', 'remove', id);
  }

  function cancel() {
    initialise('default');
  }

  function submit(actionForm) {
    if (actionForm.$invalid) {
      return;
    }
    map[vm.action].submit(vm.depot.uuid);
  }

  function createDepot() {
    vm.depot.enterprise_id = SessionService.enterprise.id;
    DepotService.create(vm.depot)
    .then(function (res) {
      vm.state.created = true;
      vm.view = 'success';
    })
    .then(depotsList)
    .catch(errorHandler);
  }

  function updateDepot(uuid) {
    DepotService.update(uuid, vm.depot)
    .then(function (res) {
      vm.state.updated = true;
      vm.view = 'success';
    })
    .then(depotsList)
    .catch(errorHandler);
  }

  function removeDepot(uuid) {
    DepotService.delete(uuid)
    .then(function (res) {
      vm.state.removed = true;
      vm.view = 'success';
    })
    .then(depotsList)
    .catch(errorHandler);
  }

  function errorHandler(err) {
    vm.state.errored = true;
    console.log(err);
  }

  function initialise(view, action, uuid) {
    vm.state.reset();
    vm.view   = view;
    vm.action = action;
    vm.depot  = {};

    vm.actionTitle = map[action].title;

    if (uuid && (action === 'update' || action === 'remove')) {
      DepotService.read(uuid)
      .then(function (depot) {
        vm.depot = depot;
      });
    }
  }

  function refreshValidation() {
    vm.state.errored = vm.depot.text ? false : true;
  }

  vm.state.reset = function reset() {
    vm.state.errored = false;
    vm.state.updated = false;
    vm.state.created = false;
    vm.state.removed = false;
  };
}
