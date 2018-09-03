angular.module('bhima.controllers')
  .controller('ImportAccountsController', ImportAccountsController);

ImportAccountsController.$inject = [
  '$uibModalInstance', 'AccountService', 'Upload', 'NotifyService', '$state',
];

function ImportAccountsController(Instance, Accounts, Upload, Notify, $state) {
  const vm = this;

  vm.LOAD_DEFAULT_OHADA_ACCOUNTS = 1;
  vm.LOAD_OHADA_ACCOUNTS = 2;
  vm.LOAD_OTHER_ACCOUNTS = 3;

  vm.downloadTemplate = Accounts.downloadAccountsTemplate;
  vm.cancel = Instance.close;

  vm.select = (file) => {
    vm.noSelectedFile = !file;
  };

  vm.submit = () => {
    // send data only when a file is selected
    if ((vm.option !== vm.LOAD_DEFAULT_OHADA_ACCOUNTS) && !vm.file) {
      vm.noSelectedFile = true;
      return null;
    }

    return uploadFile(vm.file);
  };

  vm.cancel = () => {
    $state.go('accounts.list');
  };

  /** upload the file to server */
  function uploadFile(file) {
    vm.uploadState = 'uploading';

    const params = {
      url : '/accounts/import/',
      data : { file },
      params : { option : vm.option },
    };

    // upload the file to the server
    return Upload.upload(params)
      .then(handleSuccess, handleError, handleProgress);

    // success upload handler
    function handleSuccess() {
      vm.uploadState = 'uploaded';
      Notify.success('ACCOUNT.IMPORT.UPLOAD_SUCCESS');
      $state.go('accounts.list');
      Instance.close();
    }

    function handleError(err) {
      Notify.handleError(err);
      $state.go('accounts.list');
      Instance.close();
    }

    // progress handler
    function handleProgress(evt) {
      file.progress = Math.min(100, parseInt((100.0 * evt.loaded) / evt.total, 10));
      vm.progressStyle = { width : String(file.progress).concat('%') };
    }
  }
}
