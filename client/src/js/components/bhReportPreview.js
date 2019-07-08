angular.module('bhima.components')
  .component('bhReportPreview', {
    bindings : {
      sourceDocument : '<',
      onClearCallback : '&', // called on the template for claering the preview (go back to report config)
      onSaveCallback : '&', // called on the template for saving the report
    },
    templateUrl : 'modules/templates/bhReportPreview.tmpl.html',
    controller : bhReportPreviewController,
  });

bhReportPreviewController.$inject = ['$window'];

function bhReportPreviewController($window) {
  const $ctrl = this;

  // bind methods
  $ctrl.onPrintCallback = function onPrintCallback() {
    $window.frames.report.focus();
    $window.frames.report.print();
  };

}
