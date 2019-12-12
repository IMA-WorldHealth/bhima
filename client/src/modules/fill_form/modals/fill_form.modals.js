angular.module('bhima.controllers')
  .controller('FillFormModalController', FillFormModalController);

FillFormModalController.$inject = [
  '$state', 'FillFormService', 'NotifyService', 'appcache', 'SurveyFormService',
  'DataCollectorManagementService', 'Upload', 'PatientService',
];

/**
 * FILL FORM Modal Controller
 */

function FillFormModalController($state, FillForm, Notify, AppCache,
  SurveyForm, DataCollectorManagement, Upload, Patients) {
  const vm = this;
  const cache = AppCache('FillFormModalController');

  vm.stateParams = {};

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;
  vm.clear = clear;
  vm.form = {};
  vm.dataCollector = {};
  vm.onSelectList = onSelectList;
  vm.onDateChange = onDateChange;
  vm.onTimeChange = onTimeChange;
  vm.onSelectMultiple = onSelectMultiple;
  vm.setThumbnail = setThumbnail;
  vm.setPatient = setPatient;
  vm.picture = {};
  vm.updateMode = false;
  vm.selectPatient = false;
  vm.containtValue = {};
  vm.include_patient_data = 0;
  let include = 0;

  if ($state.params.creating || $state.params.id) {
    cache.stateParams = $state.params;
    vm.stateParams = cache.stateParams;
  } else {
    vm.stateParams = cache.stateParams;
  }

  if (vm.stateParams.include) {
    include = parseInt(vm.stateParams.include, 0);
  }

  function onSelectList(list, value) {
    vm.form[value] = list.id;
    vm.containtValue[value] = list.label;
  }

  function onSelectMultiple(lists, value) {
    vm.form[value] = lists;
  }

  function onDateChange(date, value) {
    vm.form[value] = new Date(date);
  }

  function onTimeChange(time) {
    const timeForm = new Date(vm.form[time]);
    vm.form[time] = timeForm.getHours();
  }

  // set patient
  function setPatient(patient) {
    vm.form.patient_uuid = patient.uuid;
  }

  function uploadImage(file, uuid, key) {
    file.upload = Upload.upload({
      url : `/fill_form/${uuid}/${key}/image`,
      data : { image : file },
    });

    return file.upload
      .then(() => {
      })
      .catch((error) => {
        Notify.handleError(error);
      });
  }

  function restoreImage(file, old, uuid, key) {
    const dataImage = {
      file,
      old,
      uuid,
      key,
    };

    return FillForm.restoreImage(dataImage);
  }

  /** set thumbnail for the selected image */
  function setThumbnail(file, formName) {
    if (!file) {
      vm.documentError = true;
      return;
    }
    const isImage = file.type.includes('image/');
    vm.picture[formName] = file;
    vm.hasThumbnail = (vm.picture[formName] && isImage);
  }

  if (vm.stateParams.patient) {
    Patients.read($state.params.patient)
      .then((patient) => {
        vm.patient = patient;
      })
      .catch(Notify.handleError);
  }

  if (vm.stateParams.id && !vm.stateParams.uuid) {
    SurveyForm.read(null, { data_collector_management_id : vm.stateParams.id })
      .then(data => {
        data.forEach(item => {
          item.valueRequired = item.required ? 'required' : '';
          if (item.default) {
            vm.form[item.name] = (item.type === '1')
              ? parseInt(item.default, 10) : item.default;
          }

          if (item.calculation) {
            vm.form[item.name] = item.calculation;
          }

          if (item.constraint) {
            item.constraintCheck = FillForm.formatConstraint(item.constraint);
          }

        });
        vm.formItems = data;

        return DataCollectorManagement.read(vm.stateParams.id);
      })
      .then(dataCollector => {
        if (!vm.stateParams.patient) {
          vm.include_patient_data = dataCollector.include_patient_data;
        }

        vm.dataCollector = dataCollector;
      })
      .catch(Notify.handleError);
  } else if (vm.stateParams.id && vm.stateParams.uuid) {
    vm.updateMode = true;
    SurveyForm.read(null, { data_collector_management_id : vm.stateParams.id })
      .then(data => {
        data.forEach(item => {
          item.valueRequired = item.required ? 'required' : '';
          if (item.default) {
            vm.form[item.name] = (item.type === '1')
              ? parseInt(item.default, 10) : item.default;
          }

          if (item.calculation) {
            vm.form[item.name] = item.calculation;
          }

          if (item.constraint) {
            item.constraintCheck = FillForm.formatConstraint(item.constraint);
          }

        });
        vm.formItems = data;

        return DataCollectorManagement.read(vm.stateParams.id);
      })
      .then(dataCollector => {
        vm.dataCollector = dataCollector;
        vm.include_patient_data = dataCollector.include_patient_data;

        if (vm.include_patient_data && !vm.stateParams.patient) {
          vm.selectPatient = true;
        }

        return FillForm.read(vm.stateParams.uuid);
      })
      .then(dataSurvey => {
        vm.form = FillForm.formatData(vm.formItems, dataSurvey);
        vm.oldData = FillForm.formatData(vm.formItems, dataSurvey);
      })
      .catch(Notify.handleError);

  }

  // submit the data to the server from all two forms (update, create)
  function submit(fillForm) {
    vm.hasNoChange = fillForm.$submitted && fillForm.$pristine && !vm.isCreating;
    if (fillForm.$invalid) { return null; }
    if (fillForm.$pristine) { return null; }

    vm.form.data_collector_management_id = vm.stateParams.id;
    if (vm.stateParams.patient && !vm.updateMode) {
      vm.form.patient_uuid = vm.stateParams.patient;
    }

    const dataUpdate = {
      old : vm.oldData,
      new : vm.form,
    };

    const promise = (vm.updateMode)
      ? FillForm.update(vm.stateParams.uuid, dataUpdate) : FillForm.create(vm.form);

    return promise
      .then((res) => {
        Object.keys(vm.form).forEach((key) => {
          vm.formItems.forEach(item => {
            if ((key === item.name) && (item.typeForm === 'image')) {
              if (!vm.updateMode) {
                uploadImage(vm.form[key], res.uuid, item.id);
              } else if (vm.updateMode) {
                if (vm.form[key] === vm.oldData[key]) {
                  restoreImage(vm.form[key], vm.oldData[key], res.uuid, item.id);
                } else {
                  uploadImage(vm.form[key], res.uuid, item.id);
                }
              }
            }
          });
        });
        const translateKey = (vm.updateMode) ? 'FORM.INFO.UPDATE_SUCCESS' : 'FORM.INFO.CREATE_SUCCESS';
        Notify.success(translateKey);

        if (!vm.stateParams.patient && !vm.updateMode) {
          $state.go('fill_form', null, { reload : true });
        } else if (!vm.stateParams.patient && vm.updateMode) {
          $state.go('display_metadata', { id : vm.stateParams.id }, { reload : true });
        } else if (vm.stateParams.patient && !vm.updateMode) {
          $state.go('display_metadata.patient',
            { id : vm.stateParams.id, patient : vm.stateParams.patient }, { reload : true });
        } else if (vm.stateParams.patient && vm.updateMode && !include) {
          $state.go('display_metadata', { id : vm.stateParams.id }, { reload : true });
        } else if (vm.stateParams.patient && vm.updateMode && include) {
          $state.go('display_metadata.patient',
            { id : vm.stateParams.id, patient : vm.stateParams.patient }, { reload : true });
        }
      })
      .catch(Notify.handleError);
  }

  function clear(value) {
    delete vm.form[value];
  }

  function closeModal() {
    const url = vm.updateMode ? 'display_metadata' : 'fill_form';
    if (!vm.stateParams.patient) {
      $state.go(url);
    } else if (vm.stateParams.patient) {
      $state.go('display_metadata.patient', { id : vm.stateParams.id, patient : vm.stateParams.patient });
    }
  }
}
