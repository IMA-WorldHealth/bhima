angular.module('bhima.components')
  .component('bhRendererDropdown', {
    bindings : {
      reportUrl : '@',
      reportOptions : '<'
    },
    templateUrl : 'partials/templates/bhRendererDropdown.tmpl.html',
    controller : bhRendererController
  });

bhRendererController.$inject = [ 'appcache' ];

function bhRendererController(AppCache) {
  var $ctrl = this;

  var cache = new AppCache('bhRendererComponent');

  // delay between GET request completion and loading indication, this is used
  // to compensate for the delay in browsers opening the print dialog
  var loadingIndicatorDelay = 1000;

  $ctrl.$onInit = function () {
    $ctrl.options = [
      { icon : 'file-excel-o', key : 'DOWNLOADS.CSV', parameters : { renderer: 'csv'}, type : 'application/csv' },
      { icon : 'file-pdf-o', key : 'DOWNLOADS.PDF', parameters : { renderer: 'pdf'}, type : 'application/pdf' }
    ];

    $ctrl.selection = cache.selection || $ctrl.options[0];

    $ctrl.reportOptions = $ctrl.reportOptions || {};

    $ctrl.$loading = false;
  };

  $ctrl.select = function (option) {
    $ctrl.selection = cache.selection = option;
  };

  /*
  $ctrl.$onChanges = function (changes) {
    console.log('changes:', changes);
  };
  */

  /**
   * @method toggleLoading
   *
   * @description
   * This method is responsible for updating the loading state for the controllers
   * HTTP requests.
   */
  function toggleLoading() {
    $ctrl.$loading = !$ctrl.$loading;
  }
}
