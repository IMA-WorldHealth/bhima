angular.module('bhima.controllers')
.controller('DepotManagementController', DepotManagementController);

DepotManagementController.$inject = ['$translate', 'DepotService', 'SessionService', 'FormStateFactory'];

/**
 * Depot Management Controller
 * This controller is about the depot management module in the admin zone
 * It's responsible for creating, editing and updating a depot
 */
function DepotManagementController($translate, DepotService, SessionService, StateFactory) {
  'use strict';

  var vm = this;

  /** breadcrumb configurations */
  vm.bcPaths = [
    {
      label: $translate.instant('DEPOT.DEPOTS_MANAGEMENT'),
      current: true
    }
  ];
  vm.bcButtons = [
    {
      dataMethod : 'create',
      color  : 'btn-default',
      icon   : 'glyphicon glyphicon-plus-sign',
      label  : $translate.instant('DEPOT.ADD'),
      action : create
    }
  ];

  /** init variables */
  vm.state = new StateFactory();
  vm.depot = {};

  /** Expose to the view */
  vm.update = update;
  vm.cancel = cancel;
  vm.submit = submit;

  /** Startup the module */
  (function startup() {
    depotsList();
  })();

  function depotsList() {
    DepotService.getDepots()
    .then(function (list) {
      vm.depotList = list;
    });
  }

  function update(uuid) {
    vm.state.reset();
    vm.view = 'action';
    vm.action = 'update';
    DepotService.getDepots(uuid)
    .then(function (depot) {
      vm.depot = depot;
    });
  }

  function create() {
    vm.state.reset();
    vm.view = 'action';
    vm.action = 'create';
    vm.depot = {};
  }

  function cancel() {
    vm.state.reset();
    vm.view = 'default';
    vm.depot = {};
    vm.action = null;
  }

  function submit() {
    if (vm.depot.text && vm.action === 'create') {
      createDepot();
    }
    if (vm.depot.uuid && vm.depot.text && vm.action === 'update') {
      updateDepot(vm.depot.uuid);
    }
  }

  function createDepot() {
    vm.depot.enterprise_id = SessionService.enterprise.id;
    DepotService.create(vm.depot)
    .then(function (res) {
      vm.state.created = true;
      vm.view = 'success';
    })
    .then(depotsList)
    .catch(error);
  }

  function updateDepot(uuid) {
    DepotService.update(uuid, vm.depot)
    .then(function (res) {
      vm.state.updated = true;
      vm.view = 'success';
    })
    .then(depotsList)
    .catch(error);
  }

  function error(err) {
    vm.state.errored = true;
    console.log(err);
  }

}
