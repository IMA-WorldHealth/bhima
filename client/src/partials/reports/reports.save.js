angular.module('bhima.controllers')
  .controller('SaveReportController', SaveReportController);

SaveReportController.$inject = ['$uibModalInstance', 'NotifyService', 'BaseReportService', 'options'];

function SaveReportController(ModalInstance, Notify, SavedReports, options) {
  var vm = this;
  vm.documentOptions = {};

  vm.dismiss = ModalInstance.dismiss;

  /* @TODO verify that options passed in are valid */

  vm.supportedRenderTypes = [
    { key : 'pdf', label : 'REPORTS.FILES.PDF' },
    { key : 'csv', label : 'REPORTS.FILES.CSV' }
  ];
  vm.documentOptions.renderer = vm.supportedRenderTypes[0].key;

  vm.submit = function submit(SaveForm) {
    if (SaveForm.$invalid) { return; }

    // @TODO this can directly be loaded from the form
    var reportOptions = angular.merge(vm.documentOptions, options.reportOptions);

    return SavedReports.saveReport(options.url, options.report, reportOptions)
      .then(function (result) {
        Notify.success('REPORTS.SAVE_SUCCESS');
        ModalInstance.close(result);
      })
      .catch(Notify.handleError);
  }
}
