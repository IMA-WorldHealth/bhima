angular.module('bhima.controllers')
.controller('DepotManagementController', DepotManagementController);

DepotManagementController.$inject = ['$translate', 'DepotService', 'SessionService'];

/**
 * Depot Management Controller
 * This controller is about the depot management module in the admin zone
 * It's responsible for creating, editing and updating a depot
 */
function DepotManagementController($translate, DepotService, SessionService) {
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
  vm.state = {};
  vm.depot = {};

  /** Expose to the view */
  vm.update = update;
  vm.cancel = cancel;
  vm.submit = submit;
  vm.refreshValidation = refreshValidation;

  /** Load depots */
  depotsList();

  function depotsList() {
    DepotService.getDepots()
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

  function cancel() {
    initialise('default');
  }

  function submit(invalid) {
    if (invalid) {
      vm.state.errored = true;
    }
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

  function initialise(view, action, uuid) {
    vm.state.reset();
    vm.view   = view;
    vm.action = action;
    vm.depot  = {};

    vm.actionTitle =
      action === 'create' ? 'DEPOT.ADD' :
      action === 'update' ? 'DEPOT.EDIT' : '';

    if (uuid && action === 'update') {
      DepotService.getDepots(uuid)
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
  };

}
