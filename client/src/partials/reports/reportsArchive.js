angular.module('bhima.controllers')
  .controller('ReportsArchiveController', ReportsArchiveController);

ReportsArchiveController.$inject = [
  '$state', 'BaseReportService', 'NotifyService', 'reportData'
];

function ReportsArchiveController($state, SavedReports, Notify, reportData) {
  var vm = this;

  console.log('child state got report data', reportData);
  // @TODO
  var reportId = 6;

  console.log($state);
  vm.key = $state.params.key;

  vm.deleteReport = deleteReport;

  vm.gridOptions = {
    fastWatch : true,
    flatEntityAccess : true,
    enableColumnMenus : false,
    enableSorting : false,
    appScopeProvider : vm
  };

  console.log('VM', vm.gridOptions);

  var typeTemplate = '<div class="ui-grid-cell-contents"><i class="fa fa-file-pdf-o"></i></div>';
  var dateTemplate = '<div class="ui-grid-cell-contents">{{ row.entity.timestamp | date }} (<span am-time-ago="row.entity.timestamp"></span>)</div>';

  vm.gridOptions.columnDefs = [
    { field : 'typeicon', displayName : '', cellTemplate : typeTemplate, width : 25 },
    { field : 'label', displayName : 'FORM.LABELS.LABEL', headerCellFilter : 'translate' },
    { field : 'timestamp', displayName : 'FORM.LABELS.DATE_CREATED', headerCellFilter : 'translate', cellTemplate : dateTemplate, sort : { priority : 0, direction : 'desc' } },
    { field : 'display_name', displayName : 'FORM.LABELS.USER', headerCellFilter : 'translate' },
    { field : 'actions', displayName : '', cellTemplate : '/partials/templates/actionsDropdown.html', width : 80 }
  ];

  // Load archived reports
  SavedReports.listSavedReports(reportId)
    .then(function (results) {
      vm.gridOptions.data = results;
    })
    .catch(function (error) {
      vm.hasError = true;
    })
    .finally(function () {
      vm.loading = false;
    });

  function deleteReport(uuid) {
    SavedReports.deleteReport(uuid)
      .then(function () {
        Notify.success('FORM.INFO.DELETE_SUCCESS');
        loadSavedReports();
      })
      .catch(Notify.handleError);
  }
}
