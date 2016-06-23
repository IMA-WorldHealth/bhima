angular.module('bhima.controllers')
.controller('PatientRecordController', PatientRecordController);

PatientRecordController.$inject = ['$stateParams', 'PatientService', 'NotifyService', 'moment', 'Upload', '$timeout', '$translate'];

function PatientRecordController($stateParams, Patients, Notify, moment, Upload, $timeout, $translate) {
  var vm = this;
  var patientID = $stateParams.patientID;
  
  vm.loading = true;
  vm.uploadFiles = uploadFiles;
  vm.textButton = $translate.instant('PATIENT_RECORDS.UPLOAD_PICTURE');
 
  refreshPatientsRead();

  function uploadFiles(file, errFiles) {
    vm.f = file; 
    if (file) {
      var imageCheck = file.type.search("image/");
      if(imageCheck !== -1){
        file.upload = Upload.upload({
          url: '/patients/' + patientID + '/pictures', 
          data: {pictures: file}
        });

        file.upload.then(function (response) {
          Notify.success('FORM.INFOS.PATIENT_SUCC_TRANSFERRED');
          $timeout(function () {
            file.result = response.data;
            refreshPatientsRead();
          });
        });
      } else {
        Notify.danger('FORM.INFOS.UPLOAD_PICTURE_FAILED');
      }
    }   
  }

  function refreshPatientsRead() {
    /** @fixme if no uuid is provided this will download all the patients through the base url '/' */
    Patients.read(patientID)
      .then(function (result) {
        vm.patient = result;
        vm.loading = false;

        if(vm.patient.picture_patient){
          vm.textButton = $translate.instant('PATIENT_RECORDS.UPDATE_PICTURE');
        }

        /** @todo move to service or mysql query */        
        vm.patient.name = [vm.patient.first_name, vm.patient.middle_name, vm.patient.last_name].join(' ');
        vm.patient.age = moment().diff(vm.patient.dob, 'years');
      })
      .catch(function (error) {
        vm.loading = false;
        Notify.handleError(error);
      });  
  }    
}