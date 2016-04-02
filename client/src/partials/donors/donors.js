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

  /** acions mapper */
  var map = {
    update : {
      title : 'DONOR_MANAGEMENT.UPDATE',
      submit : updateDonor
    },
    remove : {
      title : 'DONOR_MANAGEMENT.CONFIRM',
      submit : removeDonor
    },
    create : {
      title : 'DONOR_MANAGEMENT.NEW',
      submit : createDonor
    }
  };

  /** init variables */
  vm.state = {};
  vm.donor = {};

  /** Expose to the view */
  vm.update = update;
  vm.cancel = cancel;
  vm.submit = submit;
  vm.remove = remove;

  /** Load necessary data */
  donorList();

  function donorList() {
    return DonorService.read()
    .then(function (list) {
      vm.donorList = list;
    })
    .catch(errorHandler);
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

  function submit(actionForm) {
    if (actionForm.$invalid) {
      return;
    }
    map[vm.action].submit(vm.donor.id);
  }

  function createDonor() {
    DonorService.create(vm.donor)
    .then(function (res) {
      vm.state.created = true;
      vm.view = 'success';
    })
    .then(donorList)
    .catch(errorHandler);
  }

  function updateDonor(id) {
    DonorService.update(id, vm.donor)
    .then(function (res) {
      vm.state.updated = true;
      vm.view = 'success';
    })
    .then(donorList)
    .catch(errorHandler);
  }

  function removeDonor(id) {
    DonorService.remove(id)
    .then(function (res) {
      vm.state.deleted = true;
      vm.view = 'success';
    })
    .then(donorList)
    .catch(errorHandler);
  }

  function initialise(view, action, id) {
    vm.state.reset();
    vm.view   = view;
    vm.action = action;
    vm.donor  = {};

    vm.actionTitle = map[action].title;

    if (id && (action === 'update' || action === 'remove')) {
      DonorService.read(id)
      .then(function (donor) {
        vm.donor = donor;
      })
      .catch(errorHandler);
    }
  }

  function errorHandler(err) {
    console.log(err);
  }

  vm.state.reset = function reset() {
    vm.state.updated = false;
    vm.state.created = false;
    vm.state.deleted = false;
  };
}
