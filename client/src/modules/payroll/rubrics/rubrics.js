angular.module('bhima.controllers')
  .controller('RubricManagementController', RubricManagementController);

RubricManagementController.$inject = [
  'RubricService', 'ModalService',
  'NotifyService', 'uiGridConstants', '$state', 'SessionService',
];

/**
 * Rubric Management Controller
 *
 * This controller is about the Rubric management module in the admin zone
 * It's responsible for creating, editing and updating a Rubric
 */
function RubricManagementController(
  Rubrics, ModalService,
  Notify, uiGridConstants, $state, Session
) {
  var vm = this;

  // bind methods
  vm.deleteRubric = deleteRubric;
  vm.editRubric = editRubric;
  vm.createRubric = createRubric;
  vm.toggleFilter = toggleFilter;
  vm.currencySymbol = Session.enterprise.currencySymbol;

  // global variables
  vm.gridApi = {};
  vm.filterEnabled = false;

  var gridColumn =
    [
      { field : 'label', displayName : 'FORM.LABELS.DESIGNATION', headerCellFilter : 'translate' },
      { field : 'abbr', displayName : 'FORM.LABELS.ABBREVIATION', headerCellFilter : 'translate' },
      {
        field : 'is_discount', displayName : '', cellTemplate : '/modules/payroll/rubrics/templates/discount.tmpl.html', headerCellFilter : 'translate',
      },
      { field : 'value', displayName : 'FORM.LABELS.VALUE', headerCellFilter : 'translate' },
      {
        field : 'is_percent', displayName : '', cellTemplate : '/modules/payroll/rubrics/templates/percent.tmpl.html', headerCellFilter : 'translate',
      },
      {
        field : 'is_social_care', displayName : 'FORM.LABELS.IS_SOCIAL_CARE', cellTemplate : '/modules/payroll/rubrics/templates/social.tmpl.html', headerCellFilter : 'translate',
      },
      {
        field : 'is_membership_fee', displayName : 'FORM.INFO.IS_MEMBERSHIP_FEE', cellTemplate : '/modules/payroll/rubrics/templates/membership.tmpl.html', headerCellFilter : 'translate',
      },
      {
        field : 'is_tax', displayName : 'FORM.LABELS.TAX', cellTemplate : '/modules/payroll/rubrics/templates/tax.tmpl.html', headerCellFilter : 'translate',
      },
      {
        field : 'is_ipr', displayName : 'FORM.LABELS.IS_IPR', cellTemplate : '/modules/payroll/rubrics/templates/ipr.tmpl.html', headerCellFilter : 'translate',
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

  function loadRubrics() {
    vm.loading = true;

    Rubrics.read()
      .then(function (data) {
        data.forEach((row) => {
          row.expenseAccount = `[${row.six_number}] ${row.six_label}`;
          row.debtorAccount = `[${row.four_number}] ${row.four_label}`;
        });

        vm.gridOptions.data = data;
      })
      .catch(Notify.handleError)
      .finally(function () {
        vm.loading = false;
      });
  }

  // switch to delete warning mode
  function deleteRubric(title) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then(function (bool) {
        if (!bool) { return; }

        Rubrics.delete(title.id)
          .then(function () {
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
