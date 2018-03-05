angular.module('bhima.controllers')
  .controller('ImportInventoriesModalController', ImportInventoriesModalController);

ImportInventoriesModalController.$inject = [
  '$uibModalInstance', 'InventoryService', 'Upload', 'NotifyService',
];

function ImportInventoriesModalController(Instance, Inventory, Upload, Notify) {
  const vm = this;

  vm.downloadTemplate = Inventory.downloadInventoriesTemplate;
  vm.cancel = Instance.close;

  vm.select = (file) => {
    vm.noSelectedFile = !file;
  };

  vm.submit = () => {
    // send data only when a file is selected
    if (!vm.file) {
      vm.noSelectedFile = true;
      return;
    }

    uploadFile(vm.file);
  };

  /** upload the file to server */
  function uploadFile(file) {
    vm.uploadState = 'uploading';

    const params = {
      url : '/inventory/import/',
      data : { file },
    };

    // upload the file to the server
    Upload.upload(params)
      .then(handleSuccess, Notify.handleError, handleProgress);

    // success upload handler
    function handleSuccess() {
      vm.uploadState = 'uploaded';
      Notify.success('INVENTORY.UPLOAD_SUCCESS');
      Instance.close();
    }

    // progress handler
    function handleProgress(evt) {
      file.progress = Math.min(100, parseInt((100.0 * evt.loaded) / evt.total, 10));
      vm.progressStyle = { width : String(file.progress).concat('%') };
    }
  }
}
