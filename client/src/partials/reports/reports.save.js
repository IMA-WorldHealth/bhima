angular.module('bhima.controllers')
  .controller('SaveReportController', SaveReportController);

SaveReportController.$inject = ['$uibModalInstance', 'NotifyService', 'BaseReportService', 'options'];

function SaveReportController(ModalInstance, Notify, SavedReports, options) {
  var vm = this;
  vm.documentOptions = {};
  vm.report = options.report;

  vm.dismiss = ModalInstance.dismiss;

  /* @TODO verify that options passed in are valid */
  // @TODO this should be derived from the server or compiled in during the build process
  //       it should also be possible to override this depending on the support of each individual report
  vm.supportedRenderTypes = [
    { key : 'pdf', label : 'REPORT.UTIL.PDF' }
  ];
  vm.documentOptions.renderer = vm.supportedRenderTypes[0].key;

  vm.submit = function submit(SaveForm) {
    if (SaveForm.$invalid) { return; }

    // @TODO this can directly be loaded from the form
    var reportOptions = angular.merge(vm.documentOptions, options.reportOptions);

    return SavedReports.saveReport(options.url, options.report, reportOptions)
      .then(function (result) {
        Notify.success('REPORT.UTIL.SAVE_SUCCESS');
        ModalInstance.close(result);
      })
      .catch(Notify.handleError);
  }
}
