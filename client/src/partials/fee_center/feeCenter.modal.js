angular.module('bhima.controllers')
  .controller('FeeCenterModalController', FeeCenterModalController);

FeeCenterModalController.$inject = ['$state', 'ProjectService', 'FeeCenterService', 'NotifyService'];

function FeeCenterModalController($state, Projects, FeeCenter, Notify) {
  var vm = this;

  // the user object that is either edited or created
  vm.feeCenter = {};
  vm.isCreating = $state.params.creating;

  //exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;
  vm.updatePrincipal = updatePrincipal;

  Projects.read()
    .then(function (projects) {
      vm.projects = projects;
    })
    .catch(Notify.handleError);

  if (!vm.isCreating) {

    FeeCenter.read($state.params.id, { detailed : 1})
      .then(function (fc) {
        vm.feeCenter = fc;
      })
      .catch(Notify.handleError);
  }
  // submit the data to the server from all two forms (update, create)
  function submit(feeCenterForm) {
    var promise;

    if (feeCenterForm.$pristine) { return; }

    promise = (vm.isCreating) ? FeeCenter.create(vm.feeCenter) : FeeCenter.update(vm.feeCenter.id, vm.feeCenter);

    return promise
      .then(function () {
        var translateKey = (vm.isCreating) ?  'FEE_CENTER.CREATED' : 'FEE_CENTER.UPDATED';
        Notify.success(translateKey);
        $state.go('feeCenter.list', null, {reload : true});
      })
      .catch(Notify.handleError);
  }

  function closeModal () {
    $state.transitionTo('feeCenter.list');
  }

  function updatePrincipal() {
    vm.feeCenter.is_principal = 1;
  }
}


