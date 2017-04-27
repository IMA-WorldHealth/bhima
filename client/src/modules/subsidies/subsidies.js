// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
  .controller('SubsidyController', SubsidyController);

SubsidyController.$inject = [
  'SubsidyService', 'ModalService', 'util', 'NotifyService',
];

function SubsidyController(Subsidy, ModalService, util, Notify) {
  var vm = this;
  vm.session = {};
  vm.view = 'default';

  // bind methods
  vm.create = create;
  vm.submit = submit;
  vm.update = update;
  vm.del = del;
  vm.cancel = cancel;
  vm.onAccountSelect = onAccountSelect;

  vm.length250 = 200;
  vm.maxLength = util.maxTextLength;

  // fired on startup
  function startup() {
    // load Subsidies
    refreshSubsidies();
  }

  function onAccountSelect(account) {
    vm.subsidy.account_id = account.id;
  }

  function cancel() {
    vm.view = 'default';
  }

  function create() {
    vm.view = 'create';
    vm.subsidy = {};
  }

  // switch to update mode
  // data is an object that contains all the information of a subsidy
  function update(data) {
    vm.view = 'update';
    vm.subsidy = data;
  }

  // refresh the displayed Subsidies
  function refreshSubsidies() {
    return Subsidy.read(null, { detailed : 1 })
      .then(function (data) {
        vm.subsidies = data;
      });
  }

  // form submission
  function submit(invalid) {
    if (invalid) { return; }

    var promise;
    var creation = (vm.view === 'create');
    var subsidy = angular.copy(vm.subsidy);

    promise = (creation) ?
      Subsidy.create(subsidy) :
      Subsidy.update(subsidy.id, subsidy);

    promise
      .then(function (response) {
        return refreshSubsidies();
      })
      .then(function () {
        vm.view = creation ? 'create_success' : 'update_success';
      })
      .catch(Notify.handleError);
  }

  // switch to delete warning mode
  function del(subsidy) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then(function (bool){
         // if the user clicked cancel, reset the view and return
         if (!bool) {
            vm.view = 'default';
            return;
         }

        // if we get there, the user wants to delete a subsidy
        vm.view = 'delete_confirm';
        Subsidy.delete(subsidy.id)
          .then(function () {
             vm.view = 'delete_success';
             return refreshSubsidies();
          })
          .catch(Notify.handleError);
      });
  }

  startup();
}
