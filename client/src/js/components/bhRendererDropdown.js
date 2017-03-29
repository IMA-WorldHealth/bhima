angular.module('bhima.components')
  .component('bhRendererDropdown', {
    bindings : {
      reportUrl     : '@',
      reportOptions : '<',
    },
    templateUrl : 'modules/templates/bhRendererDropdown.tmpl.html',
    controller  : bhRendererController,
  });

bhRendererController.$inject = ['appcache', '$httpParamSerializer'];

function bhRendererController(AppCache, $httpParamSerializer) {
  var $ctrl = this;

  var cache = new AppCache('bhRendererComponent');

  $ctrl.$onInit = function $onInit() {
    $ctrl.options = [
      { icon: 'file-excel-o', key: 'DOWNLOADS.CSV', parameters: { renderer: 'csv' }, type: 'application/csv' },
      { icon: 'file-pdf-o', key: 'DOWNLOADS.PDF', parameters: { renderer: 'pdf' }, type: 'application/pdf' },
    ];

    $ctrl.selection = cache.selection || $ctrl.options[0];

    $ctrl.$loading = false;

    combineAndSerializeParameters();
  };

  $ctrl.select = function select(option) {
    $ctrl.selection = option;
    cache.selection = $ctrl.selection;
    combineAndSerializeParameters();
  };

  // watch for changes on the component's border and behave appropriately
  $ctrl.$onChanges = function $onChanges(changes) {
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
    var rendererParams = ($ctrl.selection && $ctrl.selection.parameters) || {};
    var reportParams = $ctrl.reportOptions || {};

    // combine the parameters into one
    var combined = angular.merge(rendererParams, reportParams);

    // serialize the parameters with the $http parameter serializer
    $ctrl.params = $httpParamSerializer(combined);
  }
}
