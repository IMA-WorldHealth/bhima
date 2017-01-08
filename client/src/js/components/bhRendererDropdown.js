angular.module('bhima.components')
  .component('bhRendererDropdown', {
    bindings : {
      reportUrl : '@',
      reportOptions : '<'
    },
    templateUrl : 'partials/templates/bhRendererDropdown.tmpl.html',
    controller : bhRendererController
  });

bhRendererController.$inject = [ 'appcache', '$http', '$timeout', '$sce', '$window' ];

function bhRendererController(AppCache, $http, $timeout, $sce, $window) {
  var $ctrl = this;

  var cache = new AppCache('bhRendererComponent');

  // delay between GET request completion and loading indication, this is used
  // to compensate for the delay in browsers opening the print dialog
  var loadingIndicatorDelay = 1000;

  $ctrl.$onInit = function () {
    $ctrl.options = [
      { icon : 'file-code-o', key : 'DOWNLOADS.JSON', parameters : { renderer: 'json'}, type : 'application/json' },
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

  $ctrl.execute = function () {
    var url = $ctrl.reportUrl;

    var parameters = {};
    angular.extend(parameters, $ctrl.reportOptions, $ctrl.selection.parameters);

    $http.get(url, { params : parameters, responseType : 'arraybuffer' })
      .then(function (response) {
        var blob = new Blob([response.data], { type: $ctrl.selection.type });
        var objectUrl = $sce.trustAsResourceUrl(URL.createObjectURL(blob));
        $window.open(objectUrl);
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(function () {
        $timeout(toggleLoading, loadingIndicatorDelay);
      });
  };

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
