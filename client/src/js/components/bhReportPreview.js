angular.module('bhima.components')
.component('bhReportPreview', {
  bindings : {
    sourceDocument : '<',
    onClearCallback : '&',
    onSaveCallback : '&'
  },
  templateUrl : 'partials/templates/bhReportPreview.tmpl.html',
  controller : bhReportPreviewController
});

function bhReportPreviewController() {
  var ctrl = this;

}
