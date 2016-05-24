angular.module('bhima.controllers')
.controller('PatientDocumentsModalController', PatientDocumentsModalController);

PatientDocumentsModalController.$inject = [
  '$uibModalInstance', 'Upload', 'patientUuid', 'PatientService', 'NotifyService'
];

function PatientDocumentsModalController(Instance, Upload, patientUuid, PatientService, Notify) {
  var vm = this;

  /** expose to the view */
  vm.submit  = submit;
  vm.close   = close;

  /** init require data  */
  PatientService.read(patientUuid)
  .then(function (patient) {
    vm.patient = patient;
  });

  /** close the modal */
  function close() {
    Instance.dismiss('cancel');
  }

  /** submit data on server */
  function submit(form) {
    if (vm.file) {
      uploadFile(vm.file);
    }
  }

  // upload on file select or drop
  function uploadFile (file) {
    var title = vm.title || file.name;
    Upload.rename(file, title);
    Upload.upload({
        url: '/patients/' + patientUuid + '/documents',
        data: { documents: file }
    }).then(function (resp) {
      // success
      vm.uploaded = true;
      Notify.success('PATIENT_DOCUMENT.UPLOAD_SUCCESS');
      Instance.close();
    }, function (resp) {
      // error
    }, function (evt) {
        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    });
  };

}
