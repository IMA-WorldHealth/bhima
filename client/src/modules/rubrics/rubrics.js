angular.module('bhima.controllers')
.controller('RubricManagementController', RubricManagementController);

RubricManagementController.$inject = [
  'RubricService', 'ModalService',
  'NotifyService', 'uiGridConstants', '$state', 'SessionService',
];

/**
 * Rubric Management Controller
 *
 * This controller is about the Payroll Rubric management module in the admin zone
 * It's responsible for creating, editing and updating a Payroll Rubric
 */
function RubricManagementController(Rubrics, ModalService,
  Notify, uiGridConstants, $state, Session) {
  var vm = this;

  // bind methods
  vm.deleteRubric = deleteRubric;
  vm.editRubric = editRubric;
  vm.createRubric = createRubric;
  vm.toggleFilter = toggleFilter;

  // global variables
  vm.gridApi = {};
  vm.filterEnabled = false;

  var gridColumn =
    [
      { field : 'label', displayName : 'FORM.LABELS.DESIGNATION', headerCellFilter : 'translate' },
      { field : 'abbr', displayName : 'FORM.LABELS.ABBREVIATION', headerCellFilter : 'translate' },
      { field : 'is_discount', displayName : '', cellTemplate : '/modules/rubrics/templates/discount.tmpl.html', headerCellFilter : 'translate' },
      { field : 'is_advance', displayName : 'FORM.LABELS.IS_ADVANCE', cellTemplate : '/modules/rubrics/templates/advance.tmpl.html', headerCellFilter : 'translate' },
      { field : 'value', displayName : 'FORM.LABELS.VALUE', headerCellFilter : 'translate' },  
      { field : 'is_percent', displayName : 'FORM.LABELS.IS_PERCENT', cellTemplate : '/modules/rubrics/templates/percent.tmpl.html', headerCellFilter : 'translate' },
      { field : 'is_social_care', displayName : 'FORM.LABELS.IS_SOCIAL_CARE', cellTemplate : '/modules/rubrics/templates/social.tmpl.html', headerCellFilter : 'translate' },
      { field : 'action',
        width : 80,
        displayName : '',
        cellTemplate : '/modules/rubrics/templates/action.tmpl.html',
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

    Rubrics.read(null, { detailed : 1 })
    .then(function (data) {
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
        Notify.success('RUBRIC.DELETED');
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