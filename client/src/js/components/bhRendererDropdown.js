angular.module('bhima.components')
  .component('bhRendererDropdown', {
    bindings : {
      reportUrl : '@',
      reportOptions : '<'
    },
    templateUrl : 'partials/templates/bhRendererDropdown.tmpl.html',
    controller : bhRendererController
  });

bhRendererController.$inject = [ 'appcache', '$httpParamSerializer' ];

function bhRendererController(AppCache, $httpParamSerializer) {
  var $ctrl = this;

  var cache = new AppCache('bhRendererComponent');

  // delay between GET request completion and loading indication, this is used
  // to compensate for the delay in browsers opening the print dialog
  // @todo - make this work!
  var loadingIndicatorDelay = 1000;

  $ctrl.$onInit = function () {
    $ctrl.options = [
      { icon : 'file-excel-o', key : 'DOWNLOADS.CSV', parameters : { renderer: 'csv'}, type : 'application/csv' },
      { icon : 'file-pdf-o', key : 'DOWNLOADS.PDF', parameters : { renderer: 'pdf'}, type : 'application/pdf' }
    ];

    $ctrl.selection = cache.selection || $ctrl.options[0];

    $ctrl.$loading = false;

    combineAndSerializeParameters();
  };

  $ctrl.select = function (option) {
    $ctrl.selection = cache.selection = option;
  };

  // watch for changes on the component's border and behave appropriately
  $ctrl.$onChanges = function (changes) {
    var hasParameterChanges = (changes && changes.reportOptions);

    // if there are changes to the report options, serialize them
    if (hasParameterChanges) {
      combineAndSerializeParameters();
    }
  };

  /**
   * @method combineAndSerializeParameters
   *
   * @description
   * This method combines the renderers parameter and the reportOptions into
   * a url to be passed to ngHref.
   */
  function combineAndSerializeParameters() {
    var rendererParams = $ctrl.selection && $ctrl.selection.parameters || {};
    var reportParams = $ctrl.reportOptions || {};

    // combine the parameters into one
    var combined = angular.merge(rendererParams, reportParams);

    // serialize the parameters with the $http parameter serializer
    $ctrl.params = $httpParamSerializer(combined);
  }

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
