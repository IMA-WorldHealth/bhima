angular.module('bhima.controllers')
.controller('PatientDocumentsModalController', PatientDocumentsModalController);

PatientDocumentsModalController.$inject = [
  '$uibModalInstance', 'Upload', 'patientUuid', 'PatientService', 'NotifyService'
];

function PatientDocumentsModalController(Instance, Upload, patientUuid, PatientService, Notify) {
  var vm = this;

  // globals defaults
  vm.thumbnail = 'assets/placeholder.gif';

  // expose to the view
  vm.setThumbnail = setThumbnail;
  vm.dismiss = dismiss;
  vm.submit  = submit;
  vm.close   = close;

  // init require data
  PatientService.read(patientUuid)
  .then(function (patient) {
    vm.patient = patient;
  })
  .catch(Notify.handleError);

  /** close the modal */
  function close() {
    Instance.dismiss('cancel');
  }

  /** submit data on server */
  function submit(form) {
    // send data only when a file is selected
    if (vm.file) {
      uploadFile(vm.file);
    }
  }

  /** dismiss picture */
  function dismiss() {
    vm.file = null;
    vm.uploadState = null;
    setThumbnail();
  }

  /** set thumbnail for the selected image */
  function setThumbnail(file) {
    vm.thumbnail = file || 'assets/placeholder.gif';
  }

  /** upload the file to server */
  function uploadFile (file) {
    vm.uploadState = 'uploading';

    var title = vm.title || file.name;
    // rename the file name
    Upload.rename(file, title);

    // upload the file to the server
    Upload.upload({
        url: '/patients/' + patientUuid + '/documents',
        data: { documents: file }
    })
    .then(handleSuccess, Notify.handleError, handleProgress);

    // success upload handler
    function handleSuccess() {
      vm.uploadState = 'uploaded';
      Notify.success('PATIENT_DOCUMENT.UPLOAD_SUCCESS');
      Instance.close();
    }

    // progress handler
    function handleProgress(evt) {
      file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    }
  }
}
