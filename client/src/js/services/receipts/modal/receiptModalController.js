angular.module('bhima.controllers')
.controller('ReceiptModalController', ReceiptModalController);

ReceiptModalController.$inject = [
  '$scope', '$uibModalInstance', '$window', '$sce', 'ReceiptService', 'NotifyService', 'receipt', 'options'
];

/**
 * Receipt Modal Controller
 *
 * @param {Object} receipt   An object containing the receipt request (formatted
 *                            by the service wrapping the receipt modal). The promise
 *                            is stored in an object to ensure the modal is evaluated
 *                            before the HTTP request (promise) is resolved.
 * @param {String} template  Path to the template or resource to load
 * @param {String} render    Render target used to generate report
 */
function ReceiptModalController($scope, $modalInstance, $window, $sce, Receipts, Notify, receipt, options) {
  var vm = this;

  // expose available receipt renderers to view
  vm.renderers = Receipts.renderers;

  vm.print = print;
  vm.close = close;

  // expose options to the view
  angular.extend(vm, options);

  receipt.promise
    .then(function (result) {
      // special case for pdf rendering
      if (options.renderer === Receipts.renderers.PDF) {

        // store downloaded base64 PDF file in a browser blob - this will be accessible through 'blob://...'
        var file = new Blob([result], {type : 'application/pdf'});

        // determine the direct path to the newly (temporarily) stored PDF file
        var fileURL = URL.createObjectURL(file);

        // trust and expose the file to the view to embed the PDF
        vm.receipt = $sce.trustAsResourceUrl(fileURL);

        // ensure the blob is cleared when this $scope is cleaned up
        var cleanupListener = $scope.$on('$destroy', function () {
          // @TODO $stateChangeStart events have been depreciated as of ui-router 1.0. When this dependency is updated this
          // should be re-written to use the latest $transition standards
          URL.revokeObjectURL(fileURL);

          // de-register event listener
          cleanupListener();
        });

      } else {
        // simply expose receipt object to view
        vm.receipt = result;
      }
    })
    .catch(Notify.handleError);

  function print() {

    /**@todo This printing could be exposed by a directive/ component */
    if (options.renderer === Receipts.renderers.PDF) {

      // iframes in the DOM are all stored under the $window.frames object, this accesses the iframe with id 'pdf'
      $window.frames.pdf.contentWindow.print();
      return;
    }

    $window.print();
  }

  /** @todo use dismiss vs. close to handle error and complete exit */
  function close() {
    $modalInstance.close();
  }
}
