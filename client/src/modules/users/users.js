angular.module('bhima.controllers')
  .controller('UsersController', UsersController);

UsersController.$inject = [
  '$state', '$uibModal', 'UserService', 'NotifyService', 'ModalService', 'uiGridConstants',
  'GridStateService', 'appcache',
];

/**
 * Users Controller
 * This module is responsible for handling the CRUD operation on the user
 */
function UsersController($state, $uibModal, Users, Notify, Modal, uiGridConstants, GridState) {
  const vm = this;
  const cacheKey = 'usersGrid';

  vm.gridApi = {};
  vm.toggleFilter = toggleFilter;
  vm.editRoles = editRoles;
  vm.search = search;
  // this function selectively applies the muted cell classes to
  // disabled user entities
  function muteDisabledCells(grid, row) {
    return (row.entity.deactivated) ? `text-muted strike` : '';
  }

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    showColumnFooter : true,
    enableColumnMenus : false,
    fastWatch         : true,
    flatEntityAccess  : true,
    enableSorting     : true,
    onRegisterApi     : onRegisterApiFn,
    columnDefs : [
      {
        field : 'display_name',
        displayName : 'FORM.LABELS.USERNAME',
        headerCellFilter : 'translate',
        cellClass : muteDisabledCells,
        enableFiltering : true,
        visible : true,
        sort : { priority : 1, direction : 'asc' },
        aggregationType : uiGridConstants.aggregationTypes.count,
        aggregationHideLabel : true,
        footerCellClass : 'text-center',
      },
      {
        field : 'username',
        displayName : 'FORM.LABELS.LOGIN',
        headerCellFilter : 'translate',
        cellClass : muteDisabledCells,
        enableFiltering : true,
        visible : true,
      },
      {
        field : 'roles',
        displayName : 'FORM.LABELS.ROLES',
        headerCellFilter : 'translate',
        enableFiltering : true,
        visible : true,
        cellClass : muteDisabledCells,
      },
      {
        field : 'depots',
        displayName : 'FORM.LABELS.DEPOT',
        headerCellFilter : 'translate',
        enableFiltering : true,
        visible : true,
        cellClass : muteDisabledCells,
      },
      {
        field : 'cashboxes',
        displayName : 'FORM.LABELS.CASHBOXES',
        headerCellFilter : 'translate',
        enableFiltering : true,
        visible : true,
        cellClass : muteDisabledCells,
      },
      {
        field : 'last_login',
        type : 'date',
        displayName : 'USERS.LAST_LOGIN',
        cellFilter : 'date:"dd/MM/yyyy HH:mm:ss"',
        headerCellFilter : 'translate',
        visible : true,
        cellClass : muteDisabledCells,
      },
      {
        field : 'action',
        displayName : '',
        cellTemplate : '/modules/users/templates/grid/action.cell.html',
        enableSorting : false,
        enableFiltering : false,
      },
    ],
  };

  const state = new GridState(vm.gridOptions, cacheKey);
  vm.saveGridState = state.saveGridState;

  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
  }

  function toggleFilter() {
    vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  // bind methods
  vm.activatePermissions = activatePermissions;

  function activatePermissions(user, value, message) {
    user.deactivated = value;

    Modal.confirm(message)
      .then((confirmResponse) => {
        if (!confirmResponse) {
          return false;
        }

        // user has confirmed activation or deactivation of debtor group
        return Users.update(user.id, user)
          .then(() => {
            Notify.success('USERS.UPDATED');
            $state.go('users.list', null, { reload : true });
          })
          .catch(Notify.handleError);
      });
  }

  function handleError(error) {
    vm.hasError = true;
    vm.errorMessage = error && error.data ? error.data.description : 'An error occured';
    Notify.handleError(error);
  }

  // load user grid
  function load(filters) {
    toggleLoadingIndicator();
    vm.hasError = false;

    Users.read(null, filters)
      .then((users) => {
        vm.gridOptions.data = users;
      })
      .catch(handleError)
      .finally(() => {
        toggleLoadingIndicator();
      });
  }

  vm.onRemoveFilter = onRemoveFilter;

  function onRemoveFilter(key) {
    Users.removeFilter(key);
    Users.cacheFilters();
    vm.latestViewFilters = Users.filters.formatView();
    return load(Users.filters.formatHTTP(true));
  }

  vm.saveGridState = state.saveGridState;

  // exports zone =====================================================================

  vm.download = function download(type) {
    const filterOpts = Users.filters.formatHTTP();
    return Users.exportToQueryString(type, filterOpts);
  };

  // export excel
  vm.exportExcel = function exportExecl() {
    const filterOpts = Users.filters.formatHTTP();
    return Users.downloadExcelQueryString(filterOpts);
  };

  // end exports zone =================================================================

  function startup() {
    if ($state.params.filters && $state.params.filters.length) {
      Users.filters.replaceFiltersFromState($state.params.filters);
      Users.cacheFilters();
    }

    load(Users.filters.formatHTTP(true));
    vm.latestViewFilters = Users.filters.formatView();
  }

  function editRoles(user) {
    $uibModal.open({
      templateUrl : 'modules/roles/modal/userRole.html',
      controller : 'UsersRolesController as UsersRolesCtrl',
      resolve : { data() { return user; } },
    }).result.then(() => {
      load(Users.filters.formatHTTP(true));
    });
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  function search() {
    const filtersSnapshot = Users.filters.formatHTTP();

    Users.openSearchModal(filtersSnapshot)
      .then((changes) => {
        if (!changes) { return null; }
        Users.filters.replaceFilters(changes);
        Users.cacheFilters();
        vm.latestViewFilters = Users.filters.formatView();
        return load(Users.filters.formatHTTP(true));
      });
  }

  startup();
}
