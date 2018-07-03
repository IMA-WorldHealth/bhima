angular.module('bhima.controllers')
  .controller('PatientRecordController', PatientRecordController);

PatientRecordController.$inject = [
  '$stateParams', 'PatientService', 'NotifyService',
  'moment', 'Upload', '$timeout', 'SnapshotService',
];

function PatientRecordController($stateParams, Patients, Notify, moment, Upload, $timeout, SnapshotService) {
  const vm = this;
  const { patientUuid } = $stateParams;

  vm.loading = true;
  vm.uploadFiles = uploadFiles;
  vm.uploadButtonText = 'PATIENT_RECORDS.UPLOAD_PICTURE';

  function uploadFiles(file, invalidFiles) {
    if (invalidFiles.length) {
      Notify.danger('FORM.WARNINGS.BAD_FILE_TYPE');
      return;
    }

    if (file) {
      const imageCheck = file.type.search('image/');
      if (imageCheck !== -1) {
        file.upload = Upload.upload({
          url : `/patients/${patientUuid}/pictures`,
          data : { pictures : file },
        });

        file.upload.then((response) => {
          Notify.success('FORM.INFO.PATIENT_SUCC_TRANSFERRED');
          $timeout(() => {
            vm.patient.avatar = response.data.link;
          });
        })
          .catch((error) => {
            Notify.handleError(error);
          });
      } else {
        Notify.danger('FORM.INFO.UPLOAD_PICTURE_FAILED');
      }
    }
  }

  /** @fixme if no uuid is provided this will download all the patients through the base url '/' */
  Patients.read(patientUuid)
    .then((result) => {
      vm.patient = result;
      vm.loading = false;

      if (vm.patient.avatar) {
        vm.uploadButtonText = 'PATIENT_RECORDS.UPDATE_PICTURE';
      }

      /** @todo move to service or mysql query */
      vm.patient.name = vm.patient.display_name;
      vm.patient.age = moment().diff(vm.patient.dob, 'years');
      vm.patient.dobFormatted = moment(vm.patient.dob).format('L');
    })
    .catch((error) => {
      vm.loading = false;
      Notify.handleError(error);
    });

  // webcam functionnalities

  vm.openWebcam = function openWebcam() {
    SnapshotService.openWebcamModal()
      .then((strDataURI) => {
        if (strDataURI) {
          SnapshotService.dataUriToFile(
            strDataURI,
            'image.png',
            'image/png'
          )
            .then((file) => {
              vm.uploadFiles(file, false);
            });
        }
      });
  };
}
