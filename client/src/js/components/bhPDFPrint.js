angular.module('bhima.components')
.component('bhPdfPrint', {
  bindings : {
    pdfUrl : '@',
    disableCache: '@',
    options : '<',
    disabled : '<'
  },
  template :
    '<bh-loading-button button-class="btn-default" loading-state="$ctrl.$loading" ng-click="$ctrl.print()" disabled="$ctrl.disabled">' +
      '<span><i class="fa fa-print"></i> {{ "FORM.BUTTONS.PRINT" | translate }}</span>' +
    '</bh-loading-button>' +
    '<iframe ng-src="{{$ctrl.src}}" id="{{$ctrl.embeddedContentId}}" style="display : none"></iframe>',
  controller : bhPDFPrintController
});

angular.module('bhima.components')
.component('bhPdfLink', {
  bindings : {
    pdfUrl : '@',
    buttonText : '@',
    disableCache: '@',
    options : '<'
  },
  transclude : true,
  template : 
    '<a href ng-click="$ctrl.print()">' +
      '<span ng-if="!$ctrl.$loading"><i class="fa fa-print"></i> {{ $ctrl.buttonText | translate }}</span>' +
      '<span ng-if="$ctrl.$loading"><i class="fa fa-spin fa-circle-o-notch"></i> {{ "FORM.INFO.LOADING" | translate }}</span>' +
    '</a>' +
    '<iframe ng-src="{{$ctrl.src}}" id="{{$ctrl.embeddedContentId}}" style="display : none"></iframe>',
  controller : bhPDFPrintController
});


bhPDFPrintController.$inject = ['$window', '$http', '$sce', '$timeout'];

/**
 * @class bhPDFPrintController
 *
 * @description
 * This component allows printing of a BHIMA PDF report route. It abstracts the
 * server request and PDF display directly calling the browser `print()` method.
 * This directive can be used where there are no confirmation or configuration
 * steps for the report and may be abstracted in the future to allow for the
 * technology to be used in an export drop-down etc.
 *
 * The provided pdf url should be relative to the servers path and does not need
 * to include the renderer option (this is performed by the component).
 * Options will be passed as params in the get request.
 *
 * @todo Investigate abstracting direct print to browser window functionality to allow export drop-down
 *
 * @example
 * let url = '/reports/receipt/invoice';
 * let options = { filters : [] };
 *
 * <bh-pdf-print
 *   pdf-url="url"
 *   options="options"
 *   disable-cache="false">
 * </bh-pdf-print>
 */
function bhPDFPrintController($window, $http, $sce, $timeout) {
  var cachedRequest;
  var component = this;

  // Default value for buttonText
  component.buttonText = component.buttonText || 'FORM.BUTTONS.PRINT';

  // turn off caching via disable-cache="true".  Caching is enabled by default.
  var enableCache = (component.disableCache !== 'true');

  /** @todo update all options (receipt modal + direct print directive to use bhConstants included in account management PR */
  var pdfOptions = {
    renderer : 'pdf'
  };
  var responseType = 'arraybuffer';
  var pdfType = 'application/pdf';

  // delay between GET request completion and loading indication, this is used
  // to compensate for the delay in browsers opening the print dialog
  var loadingIndicatorDelay = 1000;

  component.$loading = false;
  component.embeddedContentId = 'pdfdirect-' + Date.now();

  // expose the print method to the view
  component.print = print;

  function print() {
    var url = component.pdfUrl;
    var configuration = requestOptions();

    // check to see if this request has been made before - if it has and caching is enabled,
    // we will use the local resource
    if (enableCache && angular.equals(configuration, cachedRequest)) {
      printEmbeddedContent();
      return;
    }

    cachedRequest = configuration;
    component.$loading = true;

    // return the value to allow the controller to perform error handling
    return $http.get(url, {params : configuration, responseType : responseType})
      .then(function (result) {
        var file = new Blob([result.data], {type : pdfType});
        var fileURL = URL.createObjectURL(file);

        // expose the stored pdf to the hidden view
        // the print method is automatically called with the load listener on the $window option
        component.src = $sce.trustAsResourceUrl(fileURL);
      })
      .finally(function () {
        $timeout(toggleLoading, loadingIndicatorDelay);
      });
  }

  /**
   * @method requestOptions
   *
   * @description
   * Combine the pdf options and the report options passed in from the
   * controller
   */
  function requestOptions() {
    var combined = angular.copy(pdfOptions);
    angular.extend(combined, component.options);
    return combined;
  }

  /**
   * @method toggleLoading
   *
   * @description
   * This method is responsible for updating the loading state for the controllers
   * HTTP requests.
   */
  function toggleLoading() {
    component.$loading = !component.$loading;
  }


  // ensure that the template/ iframe element is available
  // both the $onInit and $postLink methods are fired before guaranteeing the
  // id has been dynamically set
  $timeout(bindPrintEventMethod);

  function bindPrintEventMethod() {
    $window.frames[component.embeddedContentId].addEventListener('load', printEmbeddedContent);
  }

  /**
   * @method printEmbeddedContent
   *
   * @description
   *
   * register a method to invoke print on the hidden iframe on load
   * if print() is called as soon as the content is available it will not yet be
   * ready to be printed - waiting until the load event is fired ensures everything
   * is ready for printing.
   */
  function printEmbeddedContent(event) {
    // ensure this is considered in Angular's $digest
    $timeout(function () {
      // invoke print on the target window
      $window.frames[component.embeddedContentId].contentWindow.print();
    });
  }
}
