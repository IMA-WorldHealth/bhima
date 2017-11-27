angular.module('bhima.controllers')
  .controller('FunctionModalController', FunctionModalController);

FunctionModalController.$inject = [
  '$state', 'FunctionService', 'ModalService', 'NotifyService', 'appcache',
];

function FunctionModalController($state, Functions, ModalService, Notify, AppCache) {
  var vm = this;

  var cache = AppCache('FunctionModal');

  if ($state.params.creating || $state.params.id) {
    vm.stateParams = cache.stateParams = $state.params;
  } else {
    vm.stateParams = cache.stateParams;
  }
  vm.isCreating = vm.stateParams.creating;

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  if (!vm.isCreating) {
    Functions.read(vm.stateParams.id)
      .then(function (funct) {
        vm.function = funct;
      })
      .catch(Notify.handleError);
  }

  // submit the data to the server from all two forms (update, create)
  function submit(functionForm) {
    var promise;

    if (functionForm.$invalid || functionForm.$pristine) { return 0; }

    promise = (vm.isCreating) ?
      Functions.create(vm.function) :
      Functions.update(vm.function.id, vm.function);

    return promise
      .then(function () {
        var translateKey = (vm.isCreating) ? 'PROFESSION.CREATED' : 'PROFESSION.UPDATED';
        Notify.success(translateKey);
        $state.go('functions', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('functions');
  }
}
