angular.module('bhima.components')
.component('bhReportPreview', {
  bindings : {
    sourceDocument : '<',
    onClearCallback : '&',
    onSaveCallback : '&',
  },
  templateUrl : 'modules/templates/bhReportPreview.tmpl.html',
  controller : bhReportPreviewController,
});

function bhReportPreviewController() {
  var ctrl = this;

  // bind methods
  ctrl.onPrintCallback = function onPrintCallback() {
    window.frames.report.focus();
    window.frames.report.print();
  };
}
