angular.module('bhima.controllers')
    .controller('ReportGroupController', ReportGroupController);

ReportGroupController.$inject = [
  '$state', 'ReportGroupService', 'SessionService', 'util', 'NotifyService', 'ScrollService',
  'bhConstants', 'uiGridConstants', 'ModalService',
];

/**
 * Report group Controller
 *
 * @description
 *this controller enable to save,update, delete reporting groups
 * Every report that the system should send by email must be registered
 */

function ReportGroupController($state, ReportGroupSvc, Session, util, Notify, ScrollTo, bhConstants, uiGridConstants, ModalService) {
  var vm = this;
  /*
     reportGroup is the object
     that contains : code,type  and description
     in UI form
  */
  vm.reportGroup = {};
  vm.selectedReportGroup = { selected: false };
  vm.save = save;
  vm.remove = remove;

  init();

  // initialisation
  function init() {
    // If the user has selected a profile from the grill modal, fill name and email fields
    try {
      if ($state.params.data.selectedReportGroup.code) {
        vm.reportGroup = $state.params.data.selectedReportGroup;
        vm.reportGroup.old_code = vm.reportGroup.code;
        vm.selectedReportGroup.selected = true;
      }
    } catch (ex) {
      // exception
    }
  }


  // insertin a new   report group in the database

  function save(RegistrationForm) {
    // end propagation for invalid state - this could scroll to an $invalid element on the form
    if (RegistrationForm.$invalid) {
      return Notify.danger('FORM.ERRORS.INVALID');
    }

    const isReportGroup = vm.selectedReportGroup.selected === false;
    let operation;
    let msg;

    if (isReportGroup) { // should create
      operation = ReportGroupSvc.create(vm.reportGroup);
      msg = 'SAVE_SUCCESS';
    } else { // should update
      operation = ReportGroupSvc.update(vm.reportGroup);
      msg = 'UPDATE_SUCCESS';
    }

    operation.then(function (confirmation) {
      if (confirmation) {
        // msg = $translate.instant(msg);
        vm.reportGroup = {};
        RegistrationForm.$setPristine();
        RegistrationForm.$setUntouched();
        vm.selectedReportGroup.selected = false;
        ScrollTo('anchor');
        load();
        return Notify.success(msg);
      } else {
        return Notify.handleError;
      }
    })
    .catch(Notify.handleError);
    return true;
  }


  function remove(RegistrationForm) {
    ModalService.confirm('FORM.INFO.CONFIRM_DELETE_REPORT_GROUP').then(
      function (yes) {
        if (yes) {
          return ReportGroupSvc.remove(vm.reportGroup.code).then(
            function () {

              Notify.success('DELETE_SUCCESS');
              load();
                  // reset form state
              vm.reportGroup = {};
              RegistrationForm.$setPristine();
              RegistrationForm.$setUntouched();
              ScrollTo('anchor');
            }
          )
          .catch(Notify.handleError);
          }
      }
    );
  }

  // the ui grid
  vm.loading = false;
  vm.hasError = false;

    // grid columns
  const columns = [
    {
      field: 'code',
      displayName: 'FORM.LABELS.CODE',
      headerCellFilter: 'translate',
      aggregationType: uiGridConstants.aggregationTypes.count,
      width: 90,
    },
    {
      field: 'name',
      displayName: 'FORM.LABELS.NAME',
      headerCellFilter: 'translate',
    },
    {
      field: 'description',
      displayName: 'FORM.LABELS.DESCRIPTION',
      headerCellFilter: 'translate',
    },
    {
      field: 'action',
      displayName: '',
      cellTemplate: '/modules/report-group/templates/report-group-action-cell.html',
      enableFiltering: false,
      enableSorting: false,
      enableColumnMenu: false,
    },
  ];


    // options for the UI grid
  vm.gridOptions = {
    appScopeProvider: vm,
    enableColumnMenus: false,
    columnDefs: columns,
    enableSorting: true,
    showColumnFooter: true,
    fastWatch: true,
    flatEntityAccess: true,
  };


  // filling the ui grid
  function load() {

    ReportGroupSvc.read()
      .then(function (reportGroups) {
        vm.loading = false;
        vm.gridOptions.data = reportGroups;
      })
      .catch(Notify.handleError);
  }

  load();

  return vm;
}
