angular.module('bhima.controllers')
  .controller('ReportsController', ReportsController);

ReportsController.$inject = [
  '$state', 'BaseReportService', 'NotifyService'
];

function ReportsController($state, SavedReports, Notify) {
  var vm = this;
  var keyTarget = $state.params.key;

  // report configuration
  vm.report = {};

  vm.createReport = createReport;
  vm.deleteReport = deleteReport;

  vm.gridOptions = {
    fastWatch : true,
    flatEntityAccess : true,
    enableColumnMenus : false,
    enableSorting : false,
    appScopeProvider : vm
  };

  var typeTemplate = '<div class="ui-grid-cell-contents"><i class="fa fa-file-pdf-o"></i></div>';
  var dateTemplate = '<div class="ui-grid-cell-contents">{{ row.entity.timestamp | date }} (<span am-time-ago="row.entity.timestamp"></span>)</div>';
  var printTemplate = '<div class="ui-grid-cell-contents"><bh-pdf-link pdf-url="/reports/archive/{{row.entity.uuid}}"></bh-pdf-link></div>';

  vm.gridOptions.columnDefs = [
    { field : 'typeicon', displayName : '', cellTemplate : typeTemplate, width : 25 },
    { field : 'label', displayName : 'FORM.LABELS.LABEL', headerCellFilter : 'translate' },
    { field : 'timestamp', displayName : 'FORM.LABELS.DATE_CREATED', headerCellFilter : 'translate', cellTemplate : dateTemplate, sort : { priority : 0, direction : 'desc' } },
    { field : 'display_name', displayName : 'FORM.LABELS.USER', headerCellFilter : 'translate' },
    { field : 'print', displayName : '', cellTemplate : printTemplate, width : 90 },
    { field : 'actions', displayName : '', cellTemplate : '/modules/templates/actionsDropdown.html', width : 80 }
  ];


  function loadSavedReports() {
    vm.loading = true;
    vm.hasError = false;

    // Load report information based on key
    SavedReports.requestKey(keyTarget)
      .then(function (result) {
        vm.report = result[0];

        // Load archived reports
        return SavedReports.listSavedReports(vm.report.id)
          .then(function (results) {
            vm.gridOptions.data = results;
          });
        })
        .catch(function (error) {
          vm.hasError = true;
        })
        .finally(function () {
          vm.loading = false;
        });
  }

  function createReport() {
    SavedReports.openConfiguration(vm.report);
  }

  function deleteReport(uuid) {
    SavedReports.deleteReport(uuid)
      .then(function () {
        Notify.success('FORM.INFO.DELETE_SUCCESS');
        loadSavedReports();
      })
      .catch(Notify.handleError);
  }

  loadSavedReports();
}
