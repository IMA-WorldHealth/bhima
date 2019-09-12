angular.module('bhima.controllers')
  .controller('DisplayMetadataController', DisplayMetadataController);

DisplayMetadataController.$inject = [
  '$state', 'DisplayMetadataService', 'DataCollectorManagementService', 'NotifyService',
  'uiGridConstants', 'ModalService', 'PatientService', 'util', 'AppCache', 'SurveyFormService', 'ReceiptModal',
  'ChoicesListManagementService',
];

/**
 * DISPLAY METADATA CONTROLLER
 * This module is responsible for handling the CRUD operation on DISPLAY METADATA CONTROLLER
 */

function DisplayMetadataController($state, DisplayMetadata, DataCollectorManagement,
  Notify, uiGridConstants, ModalService, Patients, util, AppCache, SurveyForm, Receipts,
  ChoicesList) {
  const vm = this;
  vm.gridApi = {};
  vm.filterEnabled = false;
  vm.toggleFilter = toggleFilter;
  vm.format = util.formatDate;
  vm.search = search;
  vm.collector = {};
  vm.changes = {};
  vm.onRemove = onRemove;
  vm.displayData = displayData;
  vm.patient = {};

  vm.downloadPDF = function downloadPDF() {
    vm.patient.uuid = vm.patient ? vm.patient.uuid : '';

    return DisplayMetadata.download('pdf', vm.changes, vm.collectorId, vm.filterElements, vm.patient.uuid, vm.patient);
  };

  const cache = new AppCache('display_metadata');

  ChoicesList.read()
    .then(choicesLists => {
      vm.choicesLists = choicesLists;
    })
    .catch(Notify.handleError);

  if ($state.params.id && $state.params.patient) {
    // Prevent a non-patient form from being used to collect non-patient data
    vm.patientData = true;
  } else {
    vm.patientData = false;

    if (vm.collectorId) {
      loadGrid();
    }
  }

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    fastWatch         : true,
    flatEntityAccess  : true,
    enableSorting     : true,
    showColumnFooter  : true,
    onRegisterApi     : onRegisterApiFn,
    enableHorizontalScrollbar : uiGridConstants.scrollbars.WHEN_NEEDED,
  };

  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
  }

  function toggleFilter() {
    vm.filterEnabled = !vm.filterEnabled;
    vm.gridOptions.enableFiltering = vm.filterEnabled;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  // bind methods
  vm.edit = edit;
  vm.remove = remove;

  function edit(data) {
    if (!$state.params.patient) {
      $state.go('display_metadata.edit', { id : data.data_collector_management_id, uuid : data.uuid });
    } else if ($state.params.patient) {
      $state.go('display_metadata.patientEdit', {
        id : data.data_collector_management_id,
        uuid : data.uuid,
        patient : $state.params.patient,
      });
    }
  }

  function remove(uuid) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then(() => {
        DisplayMetadata.delete(uuid)
          .then(() => {
            Notify.success('FORM.INFO.DELETE_SUCCESS');
            loadGrid();
          })
          .catch(Notify.handleError);
      });
  }

  function handleError(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  // load user grid
  function loadGrid() {
    toggleLoadingIndicator();
    // Reuse cash unless patient data is consulted
    if (cache.collector && !vm.collectorId && !$state.params.patient) {
      vm.collectorId = cache.collector.id;
    }
    const changesLength = Object.keys(vm.changes).length;

    if (cache.changes && !changesLength) {
      vm.changes = cache.changes;
    }

    if (!$state.params.id && !vm.collectorId) {
      search();
    } else if (vm.collectorId && !$state.params.id) {
      vm.hasError = false;
      vm.loading = true;

      SurveyForm.read(null, { data_collector_management_id : vm.collectorId })
        .then((survey) => {
          vm.filterElements = DisplayMetadata.displayFilters(survey, vm.changes);

          vm.params = {
            data_collector_management_id : vm.collectorId,
            changes : vm.changes,
          };

          return DisplayMetadata.read(null, vm.params);
        })
        .then((data) => {
          vm.gridOptions.columnDefs = data.columns;
          vm.gridOptions.data = data.surveyData;

          return DataCollectorManagement.read(vm.collectorId);
        })
        .then((collector) => {
          cache.collector = collector;
          cache.changes = vm.changes;
          vm.collector = collector;
        })
        .catch(handleError)
        .finally(toggleLoadingIndicator);

    } else if ($state.params.id && $state.params.patient) {
      vm.hasError = false;
      vm.loading = true;
      vm.collectorId = $state.params.id;
      // View Patient Form Data
      vm.params = {
        data_collector_management_id : $state.params.id,
        patient_uuid : $state.params.patient,
        changes : vm.changes,
      };

      DisplayMetadata.read(null, vm.params)
        .then((data) => {
          vm.gridOptions.columnDefs = data.columns;
          vm.gridOptions.data = data.surveyData;

          return Patients.read($state.params.patient);
        })
        .then((patient) => {
          vm.patient = patient;
          return DataCollectorManagement.read($state.params.id);
        })
        .then((collector) => {
          vm.collector = collector;
          return SurveyForm.read(null, { data_collector_management_id : vm.collectorId });
        })
        .then((survey) => {
          vm.filterElements = DisplayMetadata.displayFilters(survey, vm.changes);
        })
        .catch(handleError)
        .finally(toggleLoadingIndicator);
    }
  }

  function toggleLoadingIndicator() {
    vm.loading = false;
  }

  // search Payroll Data
  function search() {
    DisplayMetadata.openSearchModal()
      .then((changes) => {
        vm.collectorId = changes.collectorId;
        vm.changes = changes;
        loadGrid();
      });
  }

  // On Remove all filter;
  function onRemove() {
    vm.changes = {};
    cache.changes = {};
    loadGrid();
  }

  function displayData(dataUuid) {
    Receipts.displayData(dataUuid, vm.patient, true);
  }

  loadGrid();
}
