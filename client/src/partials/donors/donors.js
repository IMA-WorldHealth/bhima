angular.module('bhima.controllers')
.controller('DonorsController', DonorsController);

DonorsController.$inject = ['$http', '$translate', 'DonorService', 'SessionService', 'uuid'];

/**
 * Donors Controller
 * This controller is about donors management module in the admin zone
 * It's responsible for crud operations for donors
 */
function DonorsController($http, $translate, DonorService, Session, uuid) {
  'use strict';

  var vm = this;

  /** breadcrumb configurations */
  vm.bcPaths = [
    {
      label: $translate.instant('DONOR_MANAGEMENT.TITLE'),
      current: true
    }
  ];
  vm.bcButtons = [
    {
      dataMethod : 'create',
      color  : 'btn-default',
      icon   : 'glyphicon glyphicon-plus-sign',
      label  : $translate.instant('DONOR_MANAGEMENT.NEW'),
      action : create
    }
  ];

  /** init variables */
  vm.state = {};
  vm.donor = {};

  /** Expose to the view */
  vm.update = update;
  vm.cancel = cancel;
  vm.submit = submit;
  vm.remove = remove;
  vm.refreshValidation = refreshValidation;

  /** Load necessary data */
  donorList();

  function donorList() {
    return DonorService.read()
    .then(function (list) {
      vm.donorList = list;
    })
    .catch(handler);
  }

  function update(id) {
    initialise('action', 'update', id);
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

  function submit(invalid) {
    if (invalid) {
      vm.state.errored = true;
      return;
    }

    // figure out what type of request to send
    var isUpdate = (vm.action === 'update');
    var isRemove = (vm.action === 'remove');

    // execute the chosen request.
    if (isUpdate) {
      updateDonor(vm.donor.id);
    } else if (isRemove) {
      removeDonor(vm.donor.id);
    } else {
      createDonor();
    }
  }

  function createDonor() {
    DonorService.create(vm.donor)
    .then(function (res) {
      vm.state.created = true;
      vm.view = 'success';
    })
    .then(donorList)
    .catch(error);
  }

  function updateDonor(id) {
    DonorService.update(id, vm.donor)
    .then(function (res) {
      vm.state.updated = true;
      vm.view = 'success';
    })
    .then(donorList)
    .catch(error);
  }

  function removeDonor(id) {
    DonorService.remove(id)
    .then(function (res) {
      vm.state.deleted = true;
      vm.view = 'success';
    })
    .then(donorList)
    .catch(error);
  }

  function initialise(view, action, id) {
    vm.state.reset();
    vm.view   = view;
    vm.action = action;
    vm.donor  = {};

    vm.actionTitle =
      action === 'create' ? 'DONOR_MANAGEMENT.NEW' :
      action === 'update' ? 'DONOR_MANAGEMENT.UPDATE' :
      action === 'remove' ? 'DONOR_MANAGEMENT.CONFIRM' : '';

    if (id && (action === 'update' || action === 'remove')) {
      DonorService.read(id)
      .then(function (donor) {
        vm.donor = donor;
      })
      .catch(handler);
    }
  }

  function refreshValidation() {
    vm.state.errored = vm.donor.name ? false : true;
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
    vm.state.deleted = false;
  };
}
