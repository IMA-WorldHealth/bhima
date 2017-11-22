angular.module('bhima.controllers')
.controller('GradeManagementController', GradeManagementController);

GradeManagementController.$inject = [
  'GradeService', 'ModalService',
  'NotifyService', 'uiGridConstants', '$state', 'SessionService',
];

/**
 * Grade Management Controller
 *
 * This controller is about the grade management module in the admin zone
 * It's responsible for creating, editing and updating a grade
 */
function GradeManagementController(Grades, ModalService,
  Notify, uiGridConstants, $state, Session) {
  var vm = this;

  // bind methods
  vm.deleteGrade = deleteGrade;
  vm.editGrade = editGrade;
  vm.createGrade = createGrade;
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
      { field : 'code', displayName : 'FORM.LABELS.CODE', headerCellFilter : 'translate' },
      { field : 'text', displayName : 'FORM.LABELS.DESIGNATION', headerCellFilter : 'translate' },
      { field : 'basic_salary',
        displayName : 'FORM.LABELS.BASIC_SALARY',
        headerCellFilter : 'translate',
        cellFilter : 'currency:'.concat(Session.enterprise.currency_id),
      },
      { field : 'action',
        width : 80,
        displayName : '',
        cellTemplate : '/modules/grades/templates/action.tmpl.html',
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

  function loadGrades() {
    vm.loading = true;

    Grades.read(null, { detailed : 1 })
    .then(function (data) {
      vm.gridOptions.data = data;
    })
    .catch(Notify.handleError)
    .finally(function () {
      vm.loading = false;
    });
  }

  // switch to delete warning mode
  function deleteGrade(grade) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
    .then(function (bool) {
      if (!bool) { return; }

      Grades.delete(grade.uuid)
      .then(function () {
        Notify.success('GRADE.DELETED');
        loadGrades();
      })
      .catch(Notify.handleError);
    });
  }

  // update an existing grade
  function editGrade(grade) {
    $state.go('grades.edit', { uuid : grade.uuid });
  }

  // create a new grade
  function createGrade() {
    $state.go('grades.create');
  }

  loadGrades();
}
