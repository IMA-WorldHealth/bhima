angular.module('bhima.controllers')
  .controller('RubricManagementController', RubricManagementController);

RubricManagementController.$inject = [
  'RubricService', 'ModalService',
  'NotifyService', 'uiGridConstants', '$state',
  'SessionService', 'GridColumnService', 'GridStateService',
  'ModalService', 'LanguageService',
];

/**
 * Rubric Management Controller
 *
 * This controller is about the Rubric management module in the admin zone
 * It's responsible for creating, editing and updating a Rubric
 */
function RubricManagementController(
  Rubrics, ModalService, Notify, uiGridConstants,
  $state, Session, Columns, GridState, Modal, Language
) {
  const vm = this;
  const cacheKey = 'RubricUigrid';

  // bind methods
  vm.deleteRubric = deleteRubric;
  vm.editRubric = editRubric;
  vm.createRubric = createRubric;
  vm.toggleFilter = toggleFilter;
  vm.openColumnConfiguration = openColumnConfiguration;
  vm.currencySymbol = Session.enterprise.currencySymbol;

  // global variables
  vm.gridApi = {};
  vm.filterEnabled = false;

  const gridColumn = [
    { field : 'label', displayName : 'FORM.LABELS.DESIGNATION', headerCellFilter : 'translate' },
    { field : 'abbr', displayName : 'FORM.LABELS.ABBREVIATION', headerCellFilter : 'translate' },
    {
      field : 'is_discount',
      displayName : '(+)/(-)',
      cellTemplate : '/modules/payroll/rubrics/templates/discount.tmpl.html',
      headerCellFilter : 'translate',
    },
    { field : 'value', displayName : 'FORM.LABELS.VALUE', headerCellFilter : 'translate' },
    {
      field : 'is_percent',
      displayName : '%',
      cellTemplate : '/modules/payroll/rubrics/templates/percent.tmpl.html',
      headerCellFilter : 'translate',
    },
    {
      field : 'is_indice',
      displayName : 'PAYROLL_RUBRIC.IS_INDICE',
      cellTemplate : '/modules/payroll/rubrics/templates/index.tmpl.html',
      headerCellFilter : 'translate',
    },
    {
      field : 'is_social_care',
      displayName : 'FORM.LABELS.IS_SOCIAL_CARE',
      cellTemplate : '/modules/payroll/rubrics/templates/social.tmpl.html',
      headerCellFilter : 'translate',
    },
    {
      field : 'is_membership_fee',
      displayName : 'FORM.INFO.IS_MEMBERSHIP_FEE',
      cellTemplate : '/modules/payroll/rubrics/templates/membership.tmpl.html',
      headerCellFilter : 'translate',
    },
    {
      field : 'is_tax',
      displayName : 'FORM.LABELS.TAX',
      cellTemplate : '/modules/payroll/rubrics/templates/tax.tmpl.html',
      headerCellFilter : 'translate',
    },
    {
      field : 'is_ipr',
      displayName : 'FORM.LABELS.IS_IPR',
      cellTemplate : '/modules/payroll/rubrics/templates/ipr.tmpl.html',
      headerCellFilter : 'translate',
    },
    {
      field : 'is_associated_employee',
      displayName : 'FORM.LABELS.EMPLOYEE_ID',
      cellTemplate : '/modules/payroll/rubrics/templates/associated.tmpl.html',
      headerCellFilter : 'translate',
    },
    {
      field : 'is_seniority_bonus',
      displayName : 'FORM.LABELS.SENIORITY_BONUS',
      cellTemplate : '/modules/payroll/rubrics/templates/seniority.tmpl.html',
      headerCellFilter : 'translate',
    },
    {
      field : 'is_family_allowances',
      displayName : 'FORM.LABELS.FAMILY_ALLOWANCES',
      cellTemplate : '/modules/payroll/rubrics/templates/allowances.tmpl.html',
      headerCellFilter : 'translate',
    },
    {
      field : 'debtorAccount', displayName : 'FORM.LABELS.DEBTOR_ACCOUNT', headerCellFilter : 'translate',
    },
    {
      field : 'expenseAccount', displayName : 'FORM.LABELS.EXPENSE_ACCOUNT', headerCellFilter : 'translate',
    },
    {
      field : 'action',
      width : 80,
      displayName : '',
      cellTemplate : '/modules/payroll/rubrics/templates/action.tmpl.html',
      enableSorting : false,
      enableFiltering : false,
    },
  ];

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    fastWatch         : true,
    flatEntityAccess  : true,
    enableSorting     : true,
    onRegisterApi     : onRegisterApiFn,
    columnDefs : gridColumn,
  };

  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
  }

  function toggleFilter() {
    vm.filterEnabled = !vm.filterEnabled;
    vm.gridOptions.enableFiltering = vm.filterEnabled;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  const columnConfig = new Columns(vm.gridOptions, cacheKey);
  const state = new GridState(vm.gridOptions, cacheKey);
  vm.saveGridState = state.saveGridState;

  vm.clearGridState = () => {
    state.clearGridState();
    $state.reload();
  };

  vm.importIndexesRubric = () => {
    Modal.confirm('PAYROLL_RUBRIC.CONFIRM_INDEXES_IMPORTATION')
      .then(bool => {
        if (!bool) { return; }
        Rubrics.importIndexes(Language.key).then(() => {
          Notify.success('FORM.INFO.OPERATION_SUCCESS');
          loadRubrics();
        })
          .catch(Notify.handleError);
      });
  };

  function openColumnConfiguration() {
    columnConfig.openConfigurationModal();
  }

  function loadRubrics() {
    vm.loading = true;

    Rubrics.read()
      .then((data) => {
        data.forEach((row) => {
          if (row.six_number || row.four_number) {
            row.expenseAccount = `[${row.six_number}] ${row.six_label}`;
            row.debtorAccount = `[${row.four_number}] ${row.four_label}`;
          }
        });

        vm.gridOptions.data = data;
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  // switch to delete warning mode
  function deleteRubric(title) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then((bool) => {
        if (!bool) { return; }

        Rubrics.delete(title.id)
          .then(() => {
            Notify.success('FORM.INFO.DELETE_SUCCESS');
            loadRubrics();
          })
          .catch(Notify.handleError);
      });
  }

  // update an existing Rubric
  function editRubric(title) {
    $state.go('rubrics.edit', { id : title.id });
  }

  // create a new Rubric
  function createRubric() {
    $state.go('rubrics.create');
  }

  loadRubrics();
}
