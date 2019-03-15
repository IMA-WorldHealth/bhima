angular.module('bhima.controllers')
  .controller('BreakEvenReferenceController', BreakEvenReferenceController);

BreakEvenReferenceController.$inject = [
  '$state', 'BreakEvenReferenceService', 'NotifyService', 'uiGridConstants', 'ModalService', '$translate',
];

/**
 * Break Even Reference Controller
 * This module is responsible for handling the CRUD operation on Break Even Reference
 */

function BreakEvenReferenceController($state, BreakEvenReference, Notify, uiGridConstants, ModalService, $translate) {
  const vm = this;
  vm.gridApi = {};
  vm.filterEnabled = false;
  vm.toggleFilter = toggleFilter;

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
        field : 'label',
        displayName : 'FORM.LABELS.DESIGNATION',
        enableFiltering : true,
        headerCellFilter : 'translate',
      },
      {
        field : 'abbr',
        displayName : 'FORM.LABELS.REFERENCE',
        enableFiltering : true,
        headerCellFilter : 'translate',
      },
      {
        field : 'hrLabel',
        displayName : '',
        enableFiltering : true,
        headerCellFilter : 'translate',
      },
      {
        field : 'action',
        displayName : '',
        enableFiltering : false,
        width : 120,
        cellTemplate : '/modules/break_even_reference/templates/action.cell.html',
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

  // bind methods
  vm.edit = edit;
  vm.remove = remove;

  function edit(breakEvenReference) {
    $state.go('break_even_reference.edit', { id : breakEvenReference.id });
  }

  function remove(id) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then(() => {
        BreakEvenReference.delete(id)
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
    vm.hasError = false;

    BreakEvenReference.read()
      .then((breakEvenReference) => {
        breakEvenReference.forEach((item) => {
          if (item.is_cost && item.is_variable) {
            item.hrLabel = $translate.instant('FORM.LABELS.VARIABLE_CHARGE');
          } else if (item.is_cost && !item.is_variable) {
            item.hrLabel = $translate.instant('FORM.LABELS.FIXED_CHARGE');
          } else if (!item.is_cost && item.is_turnover) {
            item.hrLabel = $translate.instant('FORM.LABELS.TURNOVER_REVENUE');
          } else {
            item.hrLabel = $translate.instant('FORM.LABELS.REVENUE');
          }
        });

        vm.gridOptions.data = breakEvenReference;
      })
      .catch(handleError)
      .finally(toggleLoadingIndicator);
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  loadGrid();
}
