angular.module('bhima.controllers')
  .controller('GenerateTagsModalController', GenerateTagsModalController);

GenerateTagsModalController.$inject = [
  '$uibModalInstance', 'NotifyService',
  'LotService', 'DownloadLinkService',
];

function GenerateTagsModalController(Instance, Notify, Lots, DownloadLink) {
  const vm = this;

  vm.cancel = cancel;
  vm.submit = submit;

  // submit
  function submit() {
    if (vm.totalTags <= 0 || !vm.totalTags) { return null; }

    return Lots.generateTags(vm.totalTags)
      .then(file => {
        if (!file) { return; }

        DownloadLink.download(file, 'pdf', 'barcodes');

        Instance.close();
      })
      .catch(Notify.errorHandler);
  }

  // cancel
  function cancel() {
    Instance.close();
  }
}
