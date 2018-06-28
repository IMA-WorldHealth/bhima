angular.module('bhima.controllers')
  .controller('MultiplePayrollController', MultiplePayrollController);

// dependencies injection
MultiplePayrollController.$inject = [
  'MultiplePayrollService', 'NotifyService',
  'GridSortingService', 'GridColumnService', 'GridStateService', '$state',
  'ModalService', 'util', 'ReceiptModal', 'uiGridConstants',
];

/**
 * Multiple Payroll Registry Controller
 *
 * @description
 * This controller is responsible for display all vouchers in the voucher table as a
 * registry.  The registry supports client-side filtering, server-side searching, column
 * reordering, and many more features.
 */
function MultiplePayrollController(
  MultiplePayroll, Notify,
  Sorting, Columns, GridState, $state, Modals, util, Receipts, uiGridConstants
) {
  const vm = this;
  const cacheKey = 'multiple-payroll-grid';

  vm.gridOptions = {};

  vm.search = search;
  vm.onRemoveFilter = onRemoveFilter;
  vm.openColumnConfigModal = openColumnConfigModal;
  vm.clearGridState = clearGridState;
  vm.download = MultiplePayroll.download;
  vm.toggleInlineFilter = toggleInlineFilter;

  // date format function
  vm.format = util.formatDate;

  vm.loading = false;
  vm.activePosting = true;
  vm.activeConfig = true;

  const columnDefs = [{
    field : 'display_name',
    displayName : 'FORM.LABELS.EMPLOYEE_NAME',
    headerCellFilter : 'translate',
    aggregationType  : uiGridConstants.aggregationTypes.count,
    aggregationHideLabel : true,
  }, {
    field : 'code',
    displayName : 'FORM.LABELS.CODE',
    headerCellFilter : 'translate',
  }, {
    field : 'net_salary',
    displayName : 'FORM.LABELS.NET_SALARY',
    headerCellFilter : 'translate',
    cellFilter : 'currency:row.entity.currency_id',
  }, {
    field : 'balance',
    displayName : 'FORM.LABELS.BALANCE',
    headerCellFilter : 'translate',
    cellFilter : 'currency:row.entity.currency_id',
  }, {
    field : 'status_id',
    displayName : 'FORM.LABELS.STATUS',
    headerCellFilter : 'translate',
    enableFiltering : false,
    enableSorting : false,
    cellTemplate : '/modules/multiple_payroll/templates/cellStatus.tmpl.html',
  }, {
    field : 'action',
    width : 200,
    displayName : '',
    enableFiltering : false,
    enableSorting : false,
    cellTemplate : 'modules/multiple_payroll/templates/action.tmpl.html',
  }];

  // grid default options
  vm.gridOptions = {
    appScopeProvider  : vm,
    showColumnFooter  : true,
    enableColumnMenus : false,
    flatEntityAccess  : true,
    fastWatch         : true,
    columnDefs,
    onRegisterApi : function onRegisterApi(api) {
      vm.gridApi = api;
    },
  };

  const gridColumns = new Columns(vm.gridOptions, cacheKey);
  const state = new GridState(vm.gridOptions, cacheKey);

  function toggleInlineFilter() {
    vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  // search Payroll Data
  function search() {
    const filtersSnapshot = MultiplePayroll.filters.formatHTTP();

    MultiplePayroll.openSearchModal(filtersSnapshot)
      .then((changes) => {
        if (changes.length) {
          MultiplePayroll.filters.replaceFilters(changes);
          MultiplePayroll.cacheFilters();
          vm.latestViewFilters = MultiplePayroll.filters.formatView();
          return load(MultiplePayroll.filters.formatHTTP(true));
        }
      });
  }

  function load(filters) {
    // flush error and loading states
    vm.hasError = false;
    toggleLoadingIndicator();

    MultiplePayroll.read(null, filters)
      .then((employees) => {

        vm.gridOptions.data = employees;
      })
      .catch(errorHandler)
      .finally(toggleLoadingIndicator);
  }

  // remove a filter with from the filter object, save the filters and reload
  function onRemoveFilter(key) {
    MultiplePayroll.removeFilter(key);

    MultiplePayroll.cacheFilters();
    vm.latestViewFilters = MultiplePayroll.filters.formatView();

    load(MultiplePayroll.filters.formatHTTP(true));
  }

  /**
   * @function errorHandler
   *
   * @description
   * Uses Notify to show an error in case the server sends back an information.
   * Triggers the error state on the grid.
   */
  function errorHandler(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  /**
   * @function toggleLoadingIndicator
   *
   * @description
   * Toggles the grid's loading indicator to eliminate the flash when rendering
   * transactions and allow a better UX for slow loads.
   */
  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  // initialize module
  function startup() {
    if ($state.params.filters.length) {
      MultiplePayroll.filters.replaceFiltersFromState($state.params.filters);
      MultiplePayroll.cacheFilters();
    }

    vm.latestViewFilters = MultiplePayroll.filters.formatView();

    // If there is no filter open the window to select the pay period
    if (!vm.latestViewFilters.defaultFilters.length) {
      search();
    } else {
      load(MultiplePayroll.filters.formatHTTP(true));
    }
  }

  // This function opens a modal through column service to let the user toggle
  // the visibility of the voucher registry's columns.
  function openColumnConfigModal() {
    // column configuration has direct access to the grid API to alter the current
    // state of the columns - this will be saved if the user saves the grid configuration
    gridColumns.openConfigurationModal();
  }

  //
  vm.putOnWaiting = function putOnWaiting() {
    const employees = vm.gridApi.selection.getSelectedRows();
    let invalid = false;
    let employeeStatusId;

    if (employees.length) {
      employees.forEach(employee => {
        employeeStatusId = parseInt(employee.status_id, 10);

        if (employeeStatusId !== 2) {
          invalid = true;
        }
      });

      if (invalid) {
        Notify.warn('FORM.WARNINGS.ATTENTION_WAITING_LIST');
      } else {
        vm.activePosting = false;

        const idPeriod = vm.latestViewFilters.defaultFilters[0]._value;
        MultiplePayroll.paiementCommitment(idPeriod, employees)
          .then(() => {
            Notify.success('FORM.INFO.CONFIGURED_SUCCESSFULLY');
            vm.activePosting = true;
            $state.go('multiple_payroll', null, { reload : true });
          })
          .catch(Notify.handleError);
      }
    } else {
      Notify.danger('FORM.WARNINGS.NO_EMPLOYE_SELECTED');
    }
  };


  // Set Configured
  vm.setConfigured = function setConfigured() {
    const employees = vm.gridApi.selection.getSelectedRows();
    let invalid = false;
    let employeeStatusId;

    if (employees.length) {
      employees.forEach(employee => {
        employeeStatusId = parseInt(employee.status_id, 10);

        if (employeeStatusId !== 1) {
          invalid = true;
        }
      });

      if (invalid) {
        Notify.warn('FORM.WARNINGS.ATTENTION_CONFIGURED');
      } else {
        vm.activeConfig = false;
        const idPeriod = vm.latestViewFilters.defaultFilters[0]._value;
        MultiplePayroll.configurations(idPeriod, employees)
          .then(() => {
            Notify.success('FORM.INFO.CONFIGURED_SUCCESSFULLY');
            vm.activeConfig = true;
            $state.go('multiple_payroll', null, { reload : true });
          })
          .catch(Notify.handleError);
      }
    } else {
      Notify.danger('FORM.WARNINGS.NO_EMPLOYE_SELECTED');
    }
  };

  vm.viewPaySlip = function viewPaySlip() {
    const employees = vm.gridApi.selection.getSelectedRows();
    let invalid = false;
    let employeeStatusId;

    if (employees.length) {
      employees.forEach(employee => {
        employeeStatusId = parseInt(employee.status_id, 10);

        if (employeeStatusId === 1) {
          invalid = true;
        }
      });

      if (invalid) {
        Notify.warn('FORM.WARNINGS.ATTENTION_PAYSLIPS');
      } else {
        const idPeriod = vm.latestViewFilters.defaultFilters[0]._value;

        Receipts.payroll(idPeriod, employees);
      }
    } else {
      Notify.danger('FORM.WARNINGS.NO_EMPLOYE_SELECTED');
    }
  };

  vm.paySlip = function paySlip(employee) {
    const idPeriod = vm.latestViewFilters.defaultFilters[0]._value;
    Receipts.payroll(idPeriod, employee);
  };

  vm.saveGridState = state.saveGridState;
  // saves the grid's current configuration
  function clearGridState() {
    state.clearGridState();
    $state.reload();
  }

  startup();
}
