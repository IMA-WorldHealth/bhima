angular.module('bhima.controllers')
  .controller('ServiceModalController', ServiceModalController);

ServiceModalController.$inject = [
  '$state', 'ServiceService', 'DepotService', '$translate',
  'SessionService', 'ModalService', 'util', 'NotifyService',
];

function ServiceModalController($state, Services, Depots, $translate,
  SessionService, ModalService, util, Notify) {
  var vm = this;
  var paramService = $state.params.service || {};

  vm.service = { id : paramService.id, name : paramService.name };
  vm.isCreating = !!($state.params.creating);

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  // submit the data to the server from all two forms (update, create)
  function submit(serviceForm) {
    var promise;

    if (serviceForm.$invalid || !serviceForm.$dirty) { return 0; }

    promise = (vm.isCreating) ?
      Services.create(vm.service) :
      Services.update(vm.service.id, vm.service);

    return promise
      .then(function () {
        var translateKey = (vm.isCreating) ? 'SERVICE.CREATED' : 'SERVICE.UPDATED';
        Notify.success(translateKey);
        $state.go('services', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.transitionTo('services');
  }
}
