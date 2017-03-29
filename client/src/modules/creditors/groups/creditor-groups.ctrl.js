angular.module('bhima.controllers')
  .controller('CreditorGroupController', CreditorGroupController);

CreditorGroupController.$inject = [
  '$state', 'CreditorGroupService', 'NotifyService', 'ModalService',
];

/**
 * This controller is responsible for loading creditor groups and providing basic
 * crud operations for creditor groups
 *
 * @module admin/creditor-groups
 */
function CreditorGroupController($state, CreditorGroup, Notify, Modal) {
  var vm = this;

  var uuid = $state.params.uuid;

  // global variables
  vm.bundle = {};
  vm.reload = { reload: true };
  vm.isDefaultState = ($state.current.name === 'creditorGroups');
  vm.isUpdateState = ($state.current.name === 'creditorGroups.update' && uuid);
  vm.isCreateState = ($state.current.name === 'creditorGroups.create');

  // expose to public
  vm.submit = submit;
  vm.deleteGroup = deleteGroup;
  vm.onSelectAccount = onSelectAccount;

  // load the list state
  loadListState();

  // load the detail of the creditor group
  loadDetails();

  function onSelectAccount(account) {
    vm.bundle.account_id = account.id;
  }

  // load creditor groups
  CreditorGroup.read(null, { detailed : 1 })
  .then(function (list) {
    vm.creditorGroupList = list;
  })
  .catch(Notify.handleError);

  /**
   * @function loadListState
   * set the app to creditorGroup.list
   */
  function loadListState() {
    if (!vm.isDefaultState) { return; }

    $state.go('creditorGroups.list', null, vm.reload);
  }

  /**
   * @function loadDetails
   * load details of a creditor group
   */
  function loadDetails() {
    if (!vm.isUpdateState) { return; }

    CreditorGroup.read($state.params.uuid)
      .then(function (detail) {
        vm.bundle = detail;
      })
      .catch(Notify.handleError);
  }

  /**
   * @function deleteGroup
   * @description delete a creditor group
   */
  function deleteGroup(groupUuid) {
    Modal.confirm()
    .then(function (ans) {
      if (!ans) { return false; }

      return CreditorGroup.delete(groupUuid);
    })
    .then(function (ans) {
      if (!ans) { return false; }

      Notify.success('FORM.INFO.DELETE_SUCCESS');
      $state.go('creditorGroups.list', null, vm.reload);
    })
    .catch(Notify.handleError);
  }

  /**
   * @function submit
   * submit data to the server
   */
  function submit(form) {
    if (form.$invalid) { return; }

    var promise = vm.isUpdateState ?
      CreditorGroup.update(uuid, vm.bundle) :
      CreditorGroup.create(vm.bundle);

    return promise.then(function () {
      Notify.success(vm.isUpdateState ? 'FORM.INFO.UPDATE_SUCCESS' : 'FORM.INFO.CREATE_SUCCESS');

      // navigate back to list view
      $state.go('creditorGroups.list', null, vm.reload);
    })
    .catch(Notify.handleError);
  }

}
