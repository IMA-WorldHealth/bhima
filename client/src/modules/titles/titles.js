angular.module('bhima.controllers')
  .controller('TitleManagementController', TitleManagementController);

TitleManagementController.$inject = [
  'TitleService', 'ModalService', 'NotifyService', 'uiGridConstants',
];

/**
 * Title Management Controller
 *
 * This controller is about the Job Title management module in the Human ressource zone
 * It's responsible for creating, editing and updating a Job Title
 */
function TitleManagementController(Titles, Modals, Notify, uiGridConstants) {
  const vm = this;

  // bind methods
  vm.deleteFunction = deleteTitles;
  vm.toggleFilter = toggleFilter;

  // global variables
  vm.gridApi = {};

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    fastWatch         : true,
    flatEntityAccess  : true,
    enableSorting     : true,
    onRegisterApi     : onRegisterApiFn,
    columnDefs : [{
      field : 'title_txt',
      displayName : 'FORM.LABELS.DESIGNATION',
      headerCellFilter : 'translate',
    }, {
      field : 'action',
      width : 80,
      displayName : '...',
      cellTemplate : '/modules/functions/templates/action.tmpl.html',
      enableSorting : false,
      enableFiltering : false,
    }],
  };

  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
  }

  function toggleFilter() {
    vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  function loadTitles() {
    vm.loading = true;

    Titles.read(null, { detailed : 1 })
      .then((data) => {
        vm.gridOptions.data = data;
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  // switch to delete warning mode
  function deleteTitles(profession) {
    Modals.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then((bool) => {
        if (!bool) { return; }

        Titles.delete(profession.id)
          .then(() => {
            Notify.success('FORM.INFO.DELETE_SUCCESS');
            loadTitles();
          })
          .catch(Notify.handleError);
      });
  }

  loadTitles();
}
