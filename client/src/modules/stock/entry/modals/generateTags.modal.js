angular.module('bhima.controllers')
  .controller('GenerateTagsModalController', GenerateTagsModalController);

GenerateTagsModalController.$inject = [
  '$uibModalInstance', 'LotService',
];

function GenerateTagsModalController(Instance, Lots) {
  const vm = this;

  vm.cancel = cancel;

  vm.submit = () => {
    if (!vm.totalTags || vm.totalTags > 500) { return null; }

    return Lots.generateTags(vm.totalTags);
  };

  // cancel
  function cancel() {
    Instance.close();
  }
}
