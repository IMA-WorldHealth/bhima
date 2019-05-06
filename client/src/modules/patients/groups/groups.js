angular.module('bhima.controllers')
  .controller('PatientGroupController', PatientGroupController);

PatientGroupController.$inject = [
  'PatientGroupService', 'PriceListService', 'ModalService',
  'util', 'NotifyService', 'uiGridConstants', '$state',
];

/**
 *  Patient Group Controller
 *
 *  This controller creates and updates patient groups in the application.  A
 *  Patient Group is a medical classification for patients with common
 *  properties.  For example, HIV patients, pregnant women, children under five.
 *
 *  A patient group might have an associated price list, to allow groups of
 *  patients to have different price lists due to their medical state.
 *
 *  @constructor
 */
function PatientGroupController(
  PatientGroups, PriceLists, ModalService, util, Notify, uiGridConstants, $state
) {
  const vm = this;

  // by default, set loading to false.
  vm.loading = false;
  vm.toggleFilter = toggleFilter;

  // global variables
  vm.gridApi = {};
  vm.filterEnabled = false;

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    fastWatch         : true,
    flatEntityAccess  : true,
    enableSorting     : true,
    onRegisterApi     : onRegisterApiFn,
    columnDefs : [
      {
        field : 'name',
        displayName : 'TABLE.COLUMNS.NAME',
        headerCellFilter : 'translate',
      },
      {
        field : 'priceListLabel',
        displayName : 'TABLE.COLUMNS.PRICE_LIST',
        headerCellFilter : 'translate',
      },
      {
        field : 'patientNumber',
        displayName : 'FORM.INFO.PATIENTS',
        headerCellFilter : 'translate',
      },
      {
        field : 'action',
        width : 80,
        displayName : '',
        cellTemplate : '/modules/patients/groups/templates/action.cell.html',
        enableSorting : false,
        enableFiltering : false,
      },
    ],
  };

  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
  }

  function toggleFilter() {
    vm.filterEnabled = !vm.filterEnabled;
    vm.gridOptions.enableFiltering = vm.filterEnabled;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  // This method is responsible of initializing data
  function startup() {
    // make the loading state into true, while loading data
    toggleLoadingIndicator();

    // fetching all price list
    PriceLists.read()
      .then(priceLists => {

        // attaching the price list to the view
        vm.priceLists = priceLists;

        // load all patient groups
        return loadPatientGroups();
      })
      .then(patientGroups => {
        vm.gridOptions.data = patientGroups;
      })
      .catch(Notify.handleError)
      .finally(toggleLoadingIndicator);
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  function create() {
    $state.go('patientGroups.create');
  }

  function update(uuid) {
    $state.go('patientGroups.edit', { uuid });
  }

  // this function is responsible of removing a patient group
  function remove(uuid) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then((bool) => {
        // if the user cancels, return immediately.
        if (!bool) { return; }

        PatientGroups.delete(uuid)
          .then(() => {
            Notify.success('PATIENT_GROUP.SUCCESSFULLY_DELETED');
            $state.go('patientGroups', null, { reload : true });
          })
          .catch(Notify.handleError);
      });
  }

  // this method is load the list of patient group
  function loadPatientGroups() {
    return PatientGroups.read(null, { detailed : 1 });
  }

  startup();

  // exposing interfaces to the view
  vm.create = create;
  vm.update = update;
  vm.remove = remove;
}
