angular.module('bhima.controllers')
.controller('ReportsController', ReportsController);

ReportsController.$inject = ['$state', 'BaseReportService'];

function ReportsController($state, SavedReports) {
  var vm = this;

  var keyTarget = $state.params.key;

  vm.report = {};

  vm.loading = true;
  vm.hasError = false;

  console.log(keyTarget);

  vm.gridOptions = {
    fastWatch : true,
    flatEntityAccess : true,
    enableColumnMenus : false,
    enableSorting : false
  };

  var dateTemplate = '<div class="ui-grid-cell-contents">{{ row.entity.timestamp | date }} (<span am-time-ago="row.entity.timestamp"></span>)</div>';
  var printTemplate = '<div class="ui-grid-cell-contents"><bh-pdf-link pdf-url="{{row.entity.link}}"></bh-pdf-link></div>';

  vm.gridOptions.columnDefs = [
    { field : 'label', displayName : 'FORM.LABELS.LABEL', headerCellFilter : 'translate' },
    { field : 'timestamp', displayName : 'FORM.LABELS.DATE_CREATED', headerCellFilter : 'translate', cellTemplate : dateTemplate },
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
          console.log('got report list', results);
        });
    })
    .catch(function (error) {
      vm.loading = false;
      vm.hasError = true;
    });
}
