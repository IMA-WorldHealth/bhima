// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('SubsidyController', SubsidyController);

SubsidyController.$inject = [
  'SubsidyService', 'AccountService', '$window', '$translate'
];

function SubsidyController(Subsidy , Accounts, $window, $translate) {
  var vm = this;
  vm.session = {};
  vm.view = 'default';

  // bind methods
  vm.create = create;
  vm.submit = submit;
  vm.update = update;
  vm.del    = del;
  vm.cancel = cancel;

  function handler(error) {
    console.error(error);
  }

  // fired on startup
  function startup() {
    // start up loading indicator
    vm.session.loading = true;

    // load accounts and properly formats their labels
    Accounts.read(null, { detailed : 1 })
    .then(function (accounts) {
      vm.accounts = accounts;
    })
    .catch(handler);

    // load Subsidies
    refreshSubsidies();
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
      .catch(handler);
  }

  // switch to delete warning mode
  function del(subsidy) {
    var bool = $window.confirm($translate.instant('FORM.DIALOGS.CONFIRM_DELETE'));

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
    .catch(function (error) {
      vm.HTTPError = error;
      vm.view = 'delete_error';
    });
  }

  startup();
}
