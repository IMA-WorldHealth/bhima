angular.module('bhima.controllers')
.controller('ReportsController', ReportsController);

ReportsController.$inject = ['$state', 'BaseReportService', '$uibModal'];

function ReportsController($state, SavedReports, Modal) {
  var vm = this;
  var keyTarget = $state.params.key;

  vm.report = {};
  vm.loading = true;
  vm.hasError = false;
  vm.createReport = createReport;

  vm.gridOptions = {
    fastWatch : true,
    flatEntityAccess : true,
    enableColumnMenus : false,
    enableSorting : false
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
    { field : 'actions', displayName : '', cellTemplate : '/partials/templates/actionsDropdown.html', width : 80 }
  ];

  SavedReports.requestKey(keyTarget)
    .then(function (result) {
      vm.report = result[0];

      return SavedReports.listSavedReports(vm.report.id)
        .then(function (results) {
          vm.loading = false;
          vm.gridOptions.data = results;
        });
    })
    .catch(function (error) {
      vm.loading = false;
      vm.hasError = true;
    });

  // modal is not opened through $stateProvider to allow dynamic controller
  // this should be updated if possible to allow deep linking
  function createReport() {

    // controller and template are linked by convention
    // template : /partials/reports/modals/:report_key:.modal.html
    // controller : :report_key:Controller
    var templateString = '/partials/reports/modals/'.concat(keyTarget, '.modal.html');
    var controllerString = keyTarget.concat('Controller as ReportConfigCtrl');

    return Modal.open({
      templateUrl : templateString,
      controller : controllerString,
      size : 'md'
    });
  }
}
