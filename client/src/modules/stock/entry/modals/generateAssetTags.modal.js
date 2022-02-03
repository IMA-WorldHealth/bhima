angular.module('bhima.controllers')
  .controller('GenerateTagsModalController', GenerateTagsModalController);

GenerateTagsModalController.$inject = [
  '$uibModalInstance', 'LotService',
];

function GenerateTagsModalController(Instance, Lots) {
  const vm = this;

  vm.cancel = cancel;

  vm.submit = form => {
    if (form.$invalid) { return null; }

    return Lots.generateAssetTags(vm.totalTags);
  };

  // cancel
  function cancel() {
    Instance.close();
  }
}
